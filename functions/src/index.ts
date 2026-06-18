import {initializeApp} from 'firebase-admin/app';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import {onRequest} from 'firebase-functions/v2/https';

initializeApp();

const db = getFirestore();

export const health = onRequest({region: 'asia-south1'}, (_request, response) => {
  response.status(200).json({status: 'ok', service: 'functions'});
});

export const stampUserProfileCreatedAt = onDocumentCreated(
  {
    document: 'users/{userId}',
    region: 'asia-south1',
  },
  async (event) => {
    const snapshot = event.data;

    if (!snapshot || snapshot.get('createdAt')) {
      return;
    }

    await db.doc(snapshot.ref.path).set(
      {
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      {merge: true},
    );
  },
);
