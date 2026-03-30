const BASE_URL = import.meta.env.VITE_API_URL;

export const registerUser = (data) => {
  return fetch(`${BASE_URL}/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const loginUser = (data) => {
  return fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};