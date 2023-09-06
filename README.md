# music-streaming-platform-backend
## Project Summary
This project was designed by Bhavik Bhatt, Anusha Arora, Muskaan Nandu, and Shreyas Terdalkar for a graduate Web Development course. The web app serves as a discography search website for Spotify content. Users can use the website anonymously or logged in as either artists/listeners. Users can search content using the Spotify API and search user-related information via a local Mongo database.
## Key Backend Features
The backend primarily handles the web app's connection to our local database which stores information about users who have created an account on our web app.
### Routes
we've created various routes to allow our app to interact with our local database.
**admin**
Admin routes are created to allow for a unique admin login. An admin user can see all users registered on the web app and can choose to verify or deny artist users. Verified artists will be displayed with a blue checkmark next to their name.
**albums**
Users can like and unlike albums which adds the specified album to the users 'liked albums' list. These albums are displayed on the user's profile page.
**auth**
Authentication routes allow users to sign up or login to the web app as either artists or listeners. The user data stroed includes: email, password, first name, last name, username, and role. This also assures only limited functionality is available to anonymous users.
**profile**
Profile routes let users delete their own profile or update their account information. These routes also allow users to search other profiles and view other user information, as well as follow/unfollow other users.
**songs**
Users can like and unlike songs which adds the specified songs to the users 'liked tracks' list. These songs are displayed on the user's profile page.
**user-info** 
the /search call allows users to search for other users once logged into the webapp.

