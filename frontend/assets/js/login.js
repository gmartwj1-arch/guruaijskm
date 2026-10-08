const username = document.getElementById("username");
const password = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const message = document.getElementById("message");

async function login() {

    message.style.color = "white";
    message.innerHTML = "Memproses...";

    try {

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                username: username.value.trim(),

                password: password.value

            })

        });

        const data = await response.json();

        console.log(data);

        if (data.success) {

            message.style.color = "#22c55e";
            message.innerHTML = "Login berhasil...";

            // simpan data user
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            setTimeout(() => {
                const user = data.user || {};
                const role = (user.role || "").toLowerCase();
                if (role === "admin" || role === "teacher" || role === "guru") {
                    window.location.href = "/admin";
                } else {
                    window.location.href = "/admin/guru-ai";
                }
            }, 800);

        }

        else {

            message.style.color = "#ef4444";
            message.innerHTML = data.message;

        }

    }

    catch (err) {

        console.error(err);

        message.style.color = "#ef4444";
        message.innerHTML = "Server tidak dapat dihubungi.";

    }

}

loginButton.onclick = login;

password.addEventListener("keydown", function(e){

    if(e.key === "Enter"){

        login();

    }

});