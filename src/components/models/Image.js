class Image {
  constructor({ url, public_id, userId, folder, description, createdAt }) {
    this.url = url;
    this.public_id = public_id;
    this.userId = userId;
    this.folder = folder;
    this.description = description;
    this.createdAt = createdAt || new Date();
  }
}

export default Image;
