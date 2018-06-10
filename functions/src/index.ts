import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

exports.createTeamMember = functions.database
  .ref('/teamProfile/{teamId}/teamMembers/{memberId}')
  .onCreate((snap, context) => {

    return admin
      .auth()
      .getUserByEmail(snap.val().email)
      .then(userRecord => {
        console.log("There's already another user with that email, aborting.");
        return snap.ref.set(null);
      })
      .catch(error => {
        // Access the parent node to get the Team's name.
        return snap.ref.parent.parent.child("teamName")
          .once('value', teamSnap => {
            const teamId = context.params.teamId;
            const memberId = context.params.memberId;
            const email = snap.val().email;
            const fullName = snap.val().fullName;
            const teamName = teamSnap.val();

            return admin.auth().createUser({
              uid: memberId,
              email: email,
              password: "123456789",
              displayName: fullName
            })
              .then(newUserRecord => {
                return admin.database().ref(`/userProfile/${memberId}`).set({
                  id: memberId,
                  fullName: fullName,
                  email: email,
                  teamAdmin: false,
                  teamId: teamId,
                  teamName: teamName
                })
              });
          }).catch((error) => { console.error("Error creating new user:", error); });
      });


  });