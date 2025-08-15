import { api as client } from "./client";

export const createPost = (formData) => {
  return client.post("/api/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getPosts = (params = {}) => {
  return client.get("/api/posts", { params });
};

export const getPost = (id) => {
  return client.get(`/api/posts/${id}`);
};

export const updatePost = (id, data) => {
  return client.put(`/api/posts/${id}`, data);
};

export const deletePost = (id) => {
  return client.delete(`/api/posts/${id}`);
};

export const deleteAllPosts = () => {
  return client.delete("/api/posts");
};

export const getUserStats = () => {
  return client.get("/api/posts/stats");
};

export const bulkUpdatePosts = (data) => {
  return client.put("/api/posts/bulk", data);
};
