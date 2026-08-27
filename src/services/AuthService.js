import api from "./api";

export async function login(credentials) {
    const response = await api.post("/login", credentials);

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
}

export async function register(data) {
    const response = await api.post("/register", data);

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
}

export async function getUser() {
    const response = await api.get("/user");

    const user = response.data.user;

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );

    return user;
}

export async function logout() {
    try {
        await api.post("/logout");
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
}