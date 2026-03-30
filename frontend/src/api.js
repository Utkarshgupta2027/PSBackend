const BASE_URL = import.meta.env.VITE_API_URL;

console.log("BASE_URL:", BASE_URL); // 👈 add this

export const registerUser = (data) => {
  return fetch(`${BASE_URL}/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};