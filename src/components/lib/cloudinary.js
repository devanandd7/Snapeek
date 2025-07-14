import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name:"dtdfmnfr1",
  api_key: "417269152263274",
  api_secret:"s3SpVKlxV-rvK9XmGLhJKNWD0iE",
});

// CLOUDINARY_CLOUD_NAME=dtdfmnfr1
// CLOUDINARY_API_KEY=417269152263274
// CLOUDINARY_API_SECRET=s3SpVKlxV-rvK9XmGLhJKNWD0iE
// CLOUDINARY_URL=cloudinary://417269152263274:**********@dtdfmnfr1

export default cloudinary;
