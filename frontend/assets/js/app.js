const chatBox = document.getElementById("chatBox");
const question = document.getElementById("question");
const sendButton = document.getElementById("sendButton");

function tambahPesanUser(text){

    chatBox.innerHTML += `
        <div class="message user">

            <div class="avatar">
                👨‍🎓
            </div>

            <div class="bubble">
                ${text}
            </div>

        </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;
}

function tambahPesanGuru(text){

    chatBox.innerHTML += `
        <div class="message guru">

            <div class="avatar">
                👨‍🏫
            </div>

            <div class="bubble">
                ${text}
            </div>

        </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;
}

async function kirim(){

    const teks = question.value.trim();

    if(teks === "") return;

    tambahPesanUser(teks);

    question.value = "";

    tambahPesanGuru("⌛ Guru AI sedang mengetik...");

    const loading =
        chatBox.lastElementChild.querySelector(".bubble");

    try{

        const response = await fetch("/api/chat",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                question:teks

            })

        });

        const data = await response.json();

        loading.innerHTML = data.answer;

    }

    catch(e){

        loading.innerHTML =
            "❌ Tidak dapat terhubung ke server.";

    }

    chatBox.scrollTop = chatBox.scrollHeight;

}

sendButton.onclick = kirim;

question.addEventListener("keypress",function(e){

    if(e.key==="Enter"){

        kirim();

    }

});