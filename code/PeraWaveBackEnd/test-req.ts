const testReq = async () => {
    try {
        const response = await fetch("http://localhost:8080/api/auth/mod-register-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "test@example.com" })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
    } catch (e) {
        console.error(e);
    }
}
testReq();
