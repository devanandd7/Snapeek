export default class User {
    constructor({ username, email, password }) {
      this.username = username;
      this.email = email;
      this.password = password; // Plain text for demo only!
    }
  }