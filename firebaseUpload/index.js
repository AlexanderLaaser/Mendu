const admin = require('firebase-admin');

// 1. Initialize the Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const data = require('./industries.json'); 
// data is expected to be an array of objects, each object is a document's data

/**
 * Bulk uploads data to a Firestore collection using batches.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {Array} docs - Array of document objects to be uploaded.
 */
async function bulkUpload(collectionName, docs) {
  // Use small, well-defined function: Clean Code Principle
  
  const BATCH_SIZE_LIMIT = 500; // Firestore batch commit limit
  
  // 2. Break the data into chunks if needed
  //    (Inline comment for highlight: This ensures we never exceed Firestore's batch limit)
  for (let i = 0; i < docs.length; i += BATCH_SIZE_LIMIT) {
    const batch = db.batch(); // create a new batch
    const chunk = docs.slice(i, i + BATCH_SIZE_LIMIT);

    chunk.forEach((docData) => {
      // 3. Generate a new document reference
      //    (Inline comment for highlight: We use doc() without an ID to let Firestore auto-generate one)
      const docRef = db.collection(collectionName).doc();
      batch.set(docRef, docData);
    });

    // 4. Commit the batch
    //    (Inline comment for highlight: Wrap it in a try/catch to handle errors gracefully)
    try {
      await batch.commit();
      console.log(`Successfully uploaded ${chunk.length} documents to ${collectionName}.`);
    } catch (error) {
      console.error('Error committing batch:', error);
      throw error; // Re-throw to handle or log in the outer scope
    }
  }
  
  console.log(`All data successfully uploaded to ${collectionName}.`);
}

// 5. Run the bulk upload
bulkUpload('dataset_industries', data)
  .then(() => {
    console.log('Bulk upload complete.');
  })
  .catch((err) => {
    console.error('Bulk upload failed:', err);
  });