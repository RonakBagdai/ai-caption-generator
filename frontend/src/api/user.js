import { api as client } from "./client";

export const getUserProfile = () => {
  return client.get("/api/user/profile");
};

export const updateUserProfile = (data) => {
  return client.put("/api/user/profile", data);
};

export const uploadProfilePicture = (formData) => {
  return client.post("/api/user/profile-picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProfilePicture = () => {
  return client.delete("/api/user/profile-picture");
};

export const updateUserPreferences = (data) => {
  return client.put("/api/user/preferences", data);
};
