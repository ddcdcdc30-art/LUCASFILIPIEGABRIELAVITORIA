const form = document.getElementById("formTarefa");
const campo = document.getElementById("campoTarefa");
const lista = document.getElementById("listaTarefas");
const mensagem = document.getElementById("mensagem");

const contadorTotal = document.getElementById("total");
const contadorPendentes = document.getElementById("pendentes");
const contadorConcluidas = document.getElementById("concluidas");
const rodape = document.getElementById("rodape");

const botoesFiltro = document.querySelectorAll(".filtro");
const botaoLimpar = document.getElementById("limparConcluidas");

let tarefas = [];

try {
    const salvas = JSON.parse(
        localStorage.getItem("taskflow-tarefas")
    );

    if (Array.isArray(salvas)) {
        tarefas = salvas.filter(t =>
            t &&
            typeof t.texto === "string" &&
            typeof t.concluida === "boolean" &&
            Number.isInteger(t.id)
        );
    }
} catch (erro) {
    tarefas = [];
}

let filtroAtual = "todas";

function salvarTarefas() {
    localStorage.setItem(
        "taskflow-tarefas",
        JSON.stringify(tarefas)
    );
}

function atualizarContadores() {
    const concluidas = tarefas.filter(
        tarefa => tarefa.concluida
    ).length;

    const pendentes = tarefas.length - concluidas;

    contadorTotal.textContent = tarefas.length;
    contadorPendentes.textContent = pendentes;
    contadorConcluidas.textContent = concluidas;

    rodape.textContent =
        `${tarefas.length} ${
            tarefas.length === 1 ? "tarefa cadastrada" : "tarefas cadastradas"
        }`;
}

function mostrarTarefas() {
    lista.replaceChildren();

    const filtradas = tarefas.filter(tarefa => {
        if (filtroAtual === "pendentes") {
            return !tarefa.concluida;
        }

        if (filtroAtual === "concluidas") {
            return tarefa.concluida;
        }

        return true;
    });

    if (filtradas.length === 0) {
        const vazio = document.createElement("div");
        vazio.className = "vazio";

        if (tarefas.length === 0) {
            vazio.textContent =
                "✨ Sua lista está vazia. Adicione sua primeira tarefa!";
        } else {
            vazio.textContent =
                "Nenhuma tarefa encontrada neste filtro.";
        }

        lista.appendChild(vazio);
        atualizarContadores();
        return;
    }

    filtradas.forEach(tarefa => {
        const item = document.createElement("div");
        item.className = "tarefa";

        const check = document.createElement("button");
        check.className = "check";
        check.type = "button";
        check.textContent = tarefa.concluida ? "✓" : "";
        check.setAttribute(
            "aria-label",
            tarefa.concluida
                ? "Marcar como pendente"
                : "Concluir tarefa"
        );

        if (tarefa.concluida) {
            check.classList.add("marcado");
        }

        check.addEventListener("click", () => {
            tarefa.concluida = !tarefa.concluida;
            salvarTarefas();
            mostrarTarefas();
        });

        const texto = document.createElement("span");
        texto.className = "texto-tarefa";
        texto.textContent = tarefa.texto;

        if (tarefa.concluida) {
            texto.classList.add("finalizada");
        }

        const status = document.createElement("span");
        status.className = "status";
        status.textContent = tarefa.concluida
            ? "Concluída"
            : "Pendente";

        if (tarefa.concluida) {
            status.classList.add("ok");
        }

        const excluir = document.createElement("button");
        excluir.className = "excluir";
        excluir.type = "button";
        excluir.textContent = "×";
        excluir.setAttribute("aria-label", "Excluir tarefa");

        excluir.addEventListener("click", () => {
            tarefas = tarefas.filter(
                t => t.id !== tarefa.id
            );

            salvarTarefas();
            mostrarTarefas();
        });

        item.append(check, texto, status, excluir);
        lista.appendChild(item);
    });

    atualizarContadores();
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const texto = campo.value.trim();

    if (texto === "") {
        mensagem.textContent =
            "Digite uma tarefa antes de adicionar!";
        campo.focus();
        return;
    }

    tarefas.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        texto: texto,
        concluida: false
    });

    salvarTarefas();
    filtroAtual = "todas";

    botoesFiltro.forEach(botao => {
        botao.classList.toggle(
            "ativo",
            botao.dataset.filtro === "todas"
        );
    });

    mensagem.textContent = "";
    campo.value = "";
    campo.focus();

    mostrarTarefas();
});

botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
        filtroAtual = botao.dataset.filtro;

        botoesFiltro.forEach(b => {
            b.classList.toggle("ativo", b === botao);
        });

        mostrarTarefas();
    });
});

botaoLimpar.addEventListener("click", () => {
    tarefas = tarefas.filter(
        tarefa => !tarefa.concluida
    );

    salvarTarefas();
    mostrarTarefas();
});

campo.addEventListener("input", () => {
    mensagem.textContent = "";
});

mostrarTarefas();