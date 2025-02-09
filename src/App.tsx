import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import PouchDB from "./pouchdb";

const pouch = new PouchDB("my-db.db", {
  adapter: "react-native-sqlite",
});

const TIMEOUT_DURATION = 1000;

const timeoutPromise = (timeout: number) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Operation timed out")), timeout)
  );

const docId = "mydoc:121";

export default function App() {
  const [ready, setReady] = React.useState(false);
  const [result, setResult] = React.useState("");
  const [imageData, setImageData] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    setIsLoading(false);

    pouch.info().then((info: any) => {
      console.log("connected to pouchdb :)", info);
      setReady(true);
    });

    return () => {
      pouch
        .close()
        .catch((err: Error) => console.error("Error closing database:", err));
    };
  }, []);

  const safeAsyncCall = async (
    callback: () => Promise<void>,
    shouldSetResult = true
  ) => {
    if (isLoading) return;
    setIsLoading(true);
    setResult("");
    try {
      // Timeout limit
      await Promise.race([callback(), timeoutPromise(TIMEOUT_DURATION)]);
    } catch (error: any) {
      console.error("Error:", error);
      if (shouldSetResult) setResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAllDocs = () =>
    safeAsyncCall(async () => {
      const docs = await pouch.allDocs();
      setResult(JSON.stringify(docs, null, 2));
    });

  const handleGetDoc = () =>
    safeAsyncCall(async () => {
      const mydoc = await pouch.get(docId);
      setResult(JSON.stringify(mydoc, null, 2));
    });

  const handlePutDoc = () =>
    safeAsyncCall(async () => {
      let rev,
        count = 0;

      try {
        const mydoc = await Promise.race([
          pouch.get(docId),
          timeoutPromise(TIMEOUT_DURATION),
        ]);
        rev = mydoc._rev;
        count = mydoc.count || 0;
      } catch (error: any) {
        if (error.message === "Operation timed out") {
          console.log("Document not found; creating new one.");
        } else {
          console.log("Error getting document:", error);
          return;
        }
      }

      try {
        const result = await pouch.put({
          _rev: rev,
          _id: docId,
          title: "Heroes",
          count: count + 1,
        });

        setResult(JSON.stringify(result, null, 2));
      } catch (e) {
        console.log("pouch.put Error", e);
      }
    });

  const handlePutMultiDocs = () =>
    safeAsyncCall(async () => {
      const res = await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          pouch.put({
            _id: `test:${i}`,
            title: "Heroes",
            count: i + 1,
          })
        )
      );
      setResult(JSON.stringify(res, null, 2));
    });

  const handleRemoveDoc = () =>
    safeAsyncCall(async () => {
      const mydoc = await pouch.get(docId);
      const result = await pouch.remove(mydoc);
      setResult(JSON.stringify(result, null, 2));
    });

  const handleReplicate = () =>
    safeAsyncCall(async () => {
      const result = await pouch.replicate
        .from(process.env.EXPO_PUBLIC_COUCHDB_URL, { live: false })
        .on("error", (err: any) => console.log("Replication error:", err));

      setResult(JSON.stringify(result, null, 2));
    });

  const handleDestroyDB = () =>
    safeAsyncCall(async () => {
      const result = await pouch.destroy();
      setResult(JSON.stringify(result, null, 2));
    });

  const handleDeleteAllDocs = () => {
    safeAsyncCall(async () => {
      const allDocs = await pouch.allDocs();
      const docs = allDocs.rows.map((row: any) => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true,
      }));
      const result = await pouch.bulkDocs(docs);
      setResult(JSON.stringify(result, null, 2));
    });
  };

  const handleQuery = () =>
    safeAsyncCall(async () => {
      const result = await pouch.query("index_notes", {
        startkey: ["b", "u", "book:tjnPbJakw", 2, {}, {}],
        endkey: ["b", "u", "book:tjnPbJakw", 1, 0, 0],
        include_docs: true,
        descending: true,
        limit: 50,
        skip: 0,
        conflicts: true,
      });
      setResult(JSON.stringify(result, null, 2));
    });

  const handleGetAttachment = () =>
    safeAsyncCall(async () => {
      const result = await pouch.get("file:9yqbnLGSq", {
        attachments: true,
      });
      setResult(JSON.stringify(result, null, 2));
      setImageData("data:image/png;base64," + result._attachments.index.data);
    });

  const handleClearOutput = () => setResult("");

  if (!ready)
    return (
      <View style={{ padding: 40 }}>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainerStyle}
    >
      {[
        { title: "Fetch all docs", handler: handleGetAllDocs },
        { title: "Get a doc", handler: handleGetDoc },
        { title: "Put a doc", handler: handlePutDoc },
        { title: "Put multiple docs", handler: handlePutMultiDocs },
        { title: "Delete a doc", handler: handleRemoveDoc },
        { title: "Replicate from server", handler: handleReplicate },
        { title: "Truncate DB", handler: handleDeleteAllDocs },
        { title: "Destroy DB", handler: handleDestroyDB },
        { title: "Run a query", handler: handleQuery },
        { title: "Get an attachment", handler: handleGetAttachment },
        { title: "Clear output", handler: handleClearOutput },
      ].map(({ title, handler }) => (
        <TouchableOpacity
          key={title}
          onPress={handler}
          style={styles.button}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
      ))}

      {imageData && (
        <Image
          source={{ uri: imageData }}
          style={{ width: 100, height: 50, resizeMode: "contain" }}
        />
      )}
      {result ? (
        <TouchableOpacity onPress={handleClearOutput}>
          <View
            style={{
              marginVertical: 20,
              backgroundColor: result?.startsWith("Error") ? "red" : "",
              padding: result?.startsWith("Error") ? 4 : 0,
            }}
          >
            <Text>{result}</Text>
          </View>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  contentContainerStyle: { padding: 16, paddingTop: 60 },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
