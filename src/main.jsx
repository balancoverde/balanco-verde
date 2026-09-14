import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BarChart3,
  Beaker,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Copy,
  Database,
  FileDown,
  FlaskConical,
  Gauge,
  GitBranch,
  Info,
  LayoutGrid,
  Leaf,
  Menu,
  Move,
  Package,
  PanelRight,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Undo2,
  Redo2,
  X,
  Zap
} from "lucide-react";

import "./styles.css";

const STORAGE_KEY = "balanco-verde-processos-v1";

const equipmentCatalog = [
  ["tanque", "Tanque", "TK"],
  ["misturador", "Misturador", "MIX"],
  ["separador", "Separador", "SEP"],
  ["filtro", "Filtro", "FIL"],
  ["destilador", "Destilador", "DST"],
  ["evaporador", "Evaporador", "EVA"],
  ["secador", "Secador", "SEC"],
  ["reator", "Reator", "REA"],
  ["fermentador", "Fermentador", "FER"],
  ["centrifuga", "Centrífuga", "CEN"],
  ["trocador", "Trocador", "HEX"],
  ["tratamento", "Tratamento", "TRT"],
  ["reciclo", "Reciclo", "REC"],
  ["purga", "Purga", "PUR"],
  ["divisao", "Divisão", "SPL"],
  ["generico", "Unidade personalizada", "UNI"]
];

const componentSeed = [
  "Água",
  "Etanol",
  "Açúcar",
  "Proteínas",
  "Sais",
  "CO₂",
  "Malte",
  "Lúpulo",
  "Sólidos",
  "Resíduos"
];

function newProcess(name = "Processo sem título") {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
    streams: [],
    variables: [],
    equations: [],
    components: [...componentSeed],
    notes: ""
  };
}

const beerExample = {
  ...newProcess("Produção de cerveja — exemplo"),

  nodes: [
    {
      id: "n1",
      type: "materia",
      name: "Matérias-primas",
      x: 70,
      y: 190
    },
    {
      id: "n2",
      type: "mosturacao",
      name: "Mosturação",
      x: 290,
      y: 190
    },
    {
      id: "n3",
      type: "filtro",
      name: "Filtração",
      x: 510,
      y: 190
    },
    {
      id: "n4",
      type: "fervura",
      name: "Fervura",
      x: 730,
      y: 190
    },
    {
      id: "n5",
      type: "fermentador",
      name: "Fermentação",
      x: 950,
      y: 190
    },
    {
      id: "n6",
      type: "produto",
      name: "Cerveja",
      x: 1170,
      y: 190
    }
  ],

  streams: [
    {
      id: "s1",
      name: "S1 — matéria-prima",
      from: "n1",
      to: "n2",
      flow: 1000,
      unit: "kg/h",
      components: {
        Água: 800,
        Malte: 200
      }
    },
    {
      id: "s2",
      name: "S2 — mosto",
      from: "n2",
      to: "n3",
      flow: 900,
      unit: "kg/h",
      components: {
        Água: 720,
        Malte: 180
      }
    },
    {
      id: "s3",
      name: "S3 — mosto filtrado",
      from: "n3",
      to: "n4",
      flow: 850,
      unit: "kg/h",
      components: {
        Água: 700,
        Malte: 150
      }
    },
    {
      id: "s4",
      name: "S4 — mosto fervido",
      from: "n4",
      to: "n5",
      flow: 800,
      unit: "kg/h",
      components: {
        Água: 680,
        Malte: 120
      }
    },
    {
      id: "s5",
      name: "S5 — cerveja",
      from: "n5",
      to: "n6",
      flow: 780,
      unit: "kg/h",
      components: {
        Água: 675,
        Etanol: 80,
        Sólidos: 25
      }
    },
    {
      id: "s6",
      name: "Bagaço / perdas",
      from: "n3",
      to: null,
      flow: 50,
      unit: "kg/h",
      components: {
        Sólidos: 30,
        Malte: 20
      }
    },
    {
      id: "s7",
      name: "Levedura / subproduto",
      from: "n5",
      to: null,
      flow: 20,
      unit: "kg/h",
      components: {
        Proteínas: 10,
        Sólidos: 10
      }
    }
  ],

  variables: [
    {
      id: "v1",
      name: "Vazão S1",
      value: 1000
    },
    {
      id: "v2",
      name: "Vazão S5",
      value: 780
    },
    {
      id: "v3",
      name: "Perda na filtração",
      value: 50
    },
    {
      id: "v4",
      name: "Subproduto da fermentação",
      value: 20
    }
  ],

  equations: [
    {
      id: "e1",
      name: "Balanço global simplificado",
      coeffs: {
        v1: 1,
        v2: -1,
        v3: -1,
        v4: -1
      },
      rhs: 150
    }
  ]
};

const unitFactors = {
  "kg/h": 1,
  "kg/s": 3600,
  "g/min": 0.06,
  "t/dia": 41.6666666667,
  "mol/h": 0.001,
  "kmol/h": 1,
  "L/h": 0.001,
  "m³/h": 1
};

function loadProcesses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProcesses(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function fmt(n) {
  if (!Number.isFinite(Number(n))) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2
  }).format(Number(n));
}

function rankMatrix(A) {
  if (!A.length) {
    return 0;
  }

  const M = A.map((r) => r.map(Number));
  const rows = M.length;
  const cols = M[0].length;

  let rank = 0;

  for (let c = 0; c < cols && rank < rows; c++) {
    let pivot = rank;

    for (let r = rank + 1; r < rows; r++) {
      if (Math.abs(M[r][c]) > Math.abs(M[pivot][c])) {
        pivot = r;
      }
    }

    if (Math.abs(M[pivot][c]) < 1e-9) {
      continue;
    }

    [M[rank], M[pivot]] = [M[pivot], M[rank]];

    const p = M[rank][c];

    for (let j = c; j < cols; j++) {
      M[rank][j] /= p;
    }

    for (let r = 0; r < rows; r++) {
      if (r === rank) {
        continue;
      }

      const f = M[r][c];

      for (let j = c; j < cols; j++) {
        M[r][j] -= f * M[rank][j];
      }
    }

    rank++;
  }

  return rank;
}

function analyzeSystem(variables, equations) {
  const names = variables.map((v) => v.id);

  const A = equations.map((e) =>
    names.map((id) => Number(e.coeffs?.[id] || 0))
  );

  const b = equations.map((e) => Number(e.rhs || 0));

  const rankA = rankMatrix(A);

  const aug = A.map((row, i) => [...row, b[i]]);
  const rankAug = rankMatrix(aug);

  const n = names.length;
  const m = equations.length;

  const dof = n - rankA;

  let status = "DETERMINADO";
  let kind = "unique";

  if (rankAug > rankA) {
    status = "INCONSISTENTE";
    kind = "none";
  } else if (dof > 0) {
    status = "SUBESPECIFICADO";
    kind = "infinite";
  } else if (m > n) {
    status = "SUPERESPECIFICADO";
    kind = "redundant";
  }

  return {
    n,
    m,
    rankA,
    rankAug,
    dof,
    status,
    kind
  };
}

function solveLinear(variables, equations) {
  const a = equations.map((e) =>
    variables.map((v) => Number(e.coeffs?.[v.id] || 0))
  );

  const b = equations.map((e) => Number(e.rhs || 0));

  const rows = a.length;
  const cols = variables.length;

  const M = a.map((r, i) => [...r, b[i]]);

  let row = 0;
  const pivots = [];

  for (let c = 0; c < cols && row < rows; c++) {
    let p = row;

    for (let r = row + 1; r < rows; r++) {
      if (Math.abs(M[r][c]) > Math.abs(M[p][c])) {
        p = r;
      }
    }

    if (Math.abs(M[p][c]) < 1e-9) {
      continue;
    }

    [M[row], M[p]] = [M[p], M[row]];

    const pv = M[row][c];

    for (let j = c; j <= cols; j++) {
      M[row][j] /= pv;
    }

    for (let r = 0; r < rows; r++) {
      if (r === row) {
        continue;
      }

      const f = M[r][c];

      for (let j = c; j <= cols; j++) {
        M[r][j] -= f * M[row][j];
      }
    }

    pivots.push(c);
    row++;
  }

  const info = analyzeSystem(variables, equations);

  if (info.kind === "none") {
    return {
      type: "none"
    };
  }

  if (info.kind !== "unique") {
    return {
      type: "parametric",
      pivots
    };
  }

  const x = Array(cols).fill(0);

  pivots.forEach((c, r) => {
    x[c] = M[r][cols];
  });

  return {
    type: "unique",
    values: Object.fromEntries(
      variables.map((v, i) => [v.id, x[i]])
    )
  };
}

function App() {
  const [page, setPage] = useState("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [processes, setProcesses] = useState(loadProcesses());
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 2500);

      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    saveProcesses(processes);
  }, [processes]);

  const analysis = useMemo(
    () =>
      current
        ? analyzeSystem(current.variables, current.equations)
        : {
            n: 0,
            m: 0,
            rankA: 0,
            rankAug: 0,
            dof: 0,
            status: "SEM DADOS",
            kind: "none"
          },
    [current]
  );

  const solution = useMemo(
    () =>
      current
        ? solveLinear(current.variables, current.equations)
        : null,
    [current]
  );

  function notify(t) {
    setToast(t);
  }

  function startProcess(p) {
    const copy = JSON.parse(JSON.stringify(p));

    setCurrent(copy);
    setSelected(null);
    setHistory([]);
    setFuture([]);
    setPage("builder");
  }

  function createProcess() {
    startProcess(newProcess("Meu novo processo"));
  }

  function commit(next) {
    setHistory((h) =>
      [...h, JSON.parse(JSON.stringify(current))].slice(-30)
    );

    setFuture([]);

    setCurrent({
      ...next,
      updatedAt: new Date().toISOString()
    });
  }

  function updateCurrent(fn) {
    if (!current) {
      return;
    }

    const next = JSON.parse(JSON.stringify(current));

    fn(next);

    commit(next);
  }

  function persistCurrent() {
    if (!current) {
      return;
    }

    setProcesses((ps) => [
      ...ps.filter((p) => p.id !== current.id),
      current
    ]);

    notify("Processo salvo em Meus Processos.");
  }

  function duplicateProcess(p) {
    const d = {
      ...JSON.parse(JSON.stringify(p)),
      id: crypto.randomUUID(),
      name: p.name + " — cópia",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProcesses((ps) => [d, ...ps]);

    notify("Processo duplicado.");
  }

  function deleteProcess(id) {
    setProcesses((ps) => ps.filter((p) => p.id !== id));

    if (current?.id === id) {
      setCurrent(null);
    }
  }

  function undo() {
    if (!history.length || !current) {
      return;
    }

    const prev = history[history.length - 1];

    setFuture((f) => [current, ...f]);
    setCurrent(prev);
    setHistory((h) => h.slice(0, -1));
  }

  function redo() {
    if (!future.length || !current) {
      return;
    }

    const next = future[0];

    setHistory((h) => [...h, current]);
    setCurrent(next);
    setFuture((f) => f.slice(1));
  }

  const nav = [
    ["home", "Início", LayoutGrid],
    ["builder", "Criar Processo", GitBranch],
    ["processes", "Meus Processos", Database],
    ["examples", "Exemplos", FlaskConical],
    ["calculator", "Calculadora", Calculator],
    ["challenges", "Desafios", ClipboardList],
    ["sustainability", "Sustentabilidade", Leaf],
    ["assistant", "Assistente IA", Sparkles],
    ["about", "Sobre", Info]
  ];

  return (
    <div className="app">
      <header className="topbar">
        <div
          className="brand"
          onClick={() => setPage("home")}
        >
          <div className="brand-mark">
            <Leaf size={19} />
          </div>

          <div>
            <strong>
              BALANÇO <span>VERDE</span>
            </strong>

            <small>
              Engenharia • Processos • Sustentabilidade
            </small>
          </div>
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <Menu />
        </button>

        <nav className={mobileMenu ? "nav open" : "nav"}>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                setPage(id);
                setMobileMenu(false);
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <button
          className="header-cta"
          onClick={createProcess}
        >
          <Plus size={16} />
          Novo processo
        </button>
      </header>

      <main>
        {page === "home" && (
          <Home
            onCreate={createProcess}
            onExamples={() => setPage("examples")}
            onBuilder={() => setPage("builder")}
          />
        )}

        {page === "builder" && (
          <Builder
            current={current}
            selected={selected}
            setSelected={setSelected}
            createProcess={createProcess}
            updateCurrent={updateCurrent}
            persistCurrent={persistCurrent}
            analysis={analysis}
            solution={solution}
            undo={undo}
            redo={redo}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
            notify={notify}
          />
        )}

        {page === "processes" && (
          <Processes
            processes={processes}
            onOpen={startProcess}
            onDuplicate={duplicateProcess}
            onDelete={deleteProcess}
            onCreate={createProcess}
          />
        )}

        {page === "examples" && (
          <Examples onOpen={startProcess} />
        )}

        {page === "calculator" && <CalculatorPage />}

        {page === "challenges" && (
          <Challenges onOpen={startProcess} />
        )}

        {page === "sustainability" && (
          <Sustainability current={current} />
        )}

        {page === "assistant" && <Assistant />}

        {page === "about" && <About />}
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="brand-mark">
              <Leaf size={18} />
            </div>

            <div>
              <strong>BALANÇO VERDE</strong>

              <p>
                Tecnologia aplicada ao aprendizado,
                análise de processos e eficiência material.
              </p>
            </div>
          </div>

          <div>
            <h4>Navegação</h4>

            <button onClick={() => setPage("home")}>
              Início
            </button>

            <button onClick={() => setPage("builder")}>
              Criar Processo
            </button>

            <button onClick={() => setPage("examples")}>
              Exemplos
            </button>
          </div>

          <div>
            <h4>Ferramentas</h4>

            <button onClick={() => setPage("calculator")}>
              Calculadora
            </button>

            <button onClick={() => setPage("sustainability")}>
              Sustentabilidade
            </button>

            <button onClick={() => setPage("about")}>
              Sobre
            </button>
          </div>

          <div className="footer-ifpb">
            <h4>Desenvolvimento</h4>

            <p>
              <b>Bruna Isabelly Gouveia Montenegro</b>
              <br />
              <b>Andrey Oliveira de Souza</b>
            </p>

            <img
              src="/ifpb-logo.png"
              alt="Instituto Federal da Paraíba — Campus Campina Grande"
            />
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Balanço Verde • Projeto desenvolvido em parceria
          com o IFPB — Campus Campina Grande
        </div>
      </footer>

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Home({
  onCreate,
  onExamples,
  onBuilder
}) {
  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span></span>
            PLATAFORMA DE ENGENHARIA DE PROCESSOS
          </div>

          <h1>
            Construa. Calcule.
            <br />
            <em>Analise.</em> Torne o processo mais eficiente.
          </h1>

          <p>
            Uma plataforma interativa para construção de fluxogramas,
            balanços de massa, análise de graus de liberdade e avaliação
            da eficiência de processos.
          </p>

          <div className="hero-actions">
            <button
              className="primary"
              onClick={onCreate}
            >
              CRIAR NOVO PROCESSO
              <ArrowRight size={17} />
            </button>

            <button
              className="secondary"
              onClick={onExamples}
            >
              EXPLORAR EXEMPLOS
            </button>
          </div>

          <div className="hero-metrics">
            <div>
              <b>100%</b>
              <span>modo livre</span>
            </div>

            <div>
              <b>+15</b>
              <span>equipamentos</span>
            </div>

            <div>
              <b>Real</b>
              <span>cálculos matriciais</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-grid"></div>

          <div className="process-card">
            <div className="mini-top">
              <span>VISÃO DO PROCESSO</span>
              <span className="live-dot">
                ● online
              </span>
            </div>

            <div className="flow-mini">
              <MiniNode text="Matéria-prima" />
              <ArrowRight />

              <MiniNode text="Mistura" />
              <ArrowRight />

              <MiniNode text="Separação" />
              <ArrowRight />

              <MiniNode text="Produto" />
            </div>

            <div className="flow-data">
              <span>
                Entrada <b>1.000 kg/h</b>
              </span>

              <span>
                Saída <b>920 kg/h</b>
              </span>

              <span>
                Perdas <b>8,0%</b>
              </span>
            </div>
          </div>

          <div className="float-chip chip-a">
            <Activity size={15} />
            <span>
              Grau de liberdade <b>0</b>
            </span>
          </div>

          <div className="float-chip chip-b">
            <Leaf size={15} />
            <span>
              Aproveitamento <b>92%</b>
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="kicker">
              UM AMBIENTE ÚNICO
            </span>

            <h2>
              Da ideia ao balanço validado.
            </h2>
          </div>

          <p>
            Crie processos do zero, conecte correntes,
            defina componentes e deixe a plataforma
            cuidar da álgebra.
          </p>
        </div>

        <div className="feature-grid">
          <Feature
            icon={GitBranch}
            title="Fluxogramas livres"
            text="Monte processos personalizados com equipamentos, correntes e conexões arrastáveis."
          />

          <Feature
            icon={BarChart3}
            title="Álgebra linear"
            text="Posto das matrizes, consistência, variáveis livres e grau de liberdade calculados automaticamente."
          />

          <Feature
            icon={Leaf}
            title="Eficiência material"
            text="Classifique entradas, produtos, subprodutos, resíduos e perdas para interpretar o aproveitamento."
          />
        </div>
      </section>

      <section className="section blue-section">
        <div className="section-heading">
          <div>
            <span className="kicker">
              COMECE COMO QUISER
            </span>

            <h2>
              Um espaço de trabalho feito para processos reais.
            </h2>
          </div>
        </div>

        <div className="mode-grid">
          <button onClick={onCreate}>
            <div className="mode-icon">
              <Plus />
            </div>

            <h3>Começar do zero</h3>

            <p>
              Área completamente vazia para construir
              qualquer processo industrial.
            </p>

            <span>
              ABRIR WORKSPACE
              <ArrowRight size={15} />
            </span>
          </button>

          <button onClick={onExamples}>
            <div className="mode-icon">
              <FlaskConical />
            </div>

            <h3>Usar um exemplo</h3>

            <p>
              Abra cerveja, tratamento de água e outros
              cenários para estudar e modificar.
            </p>

            <span>
              VER EXEMPLOS
              <ArrowRight size={15} />
            </span>
          </button>

          <button onClick={onBuilder}>
            <div className="mode-icon">
              <Calculator />
            </div>

            <h3>Resolver um sistema</h3>

            <p>
              Use variáveis e equações para testar
              o grau de liberdade de um balanço.
            </p>

            <span>
              IR PARA ANÁLISE
              <ArrowRight size={15} />
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

function MiniNode({ text }) {
  return (
    <div className="mini-node">
      <div className="mini-symbol"></div>
      <small>{text}</small>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text
}) {
  return (
    <div className="feature">
      <div className="feature-icon">
        <Icon size={20} />
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}

function Builder({
  current,
  selected,
  setSelected,
  createProcess,
  updateCurrent,
  persistCurrent,
  analysis,
  solution,
  undo,
  redo,
  canUndo,
  canRedo,
  notify
}) {
  const [activeTab, setActiveTab] =
    useState("equipamentos");

  const [connectMode, setConnectMode] =
    useState(false);

  const [zoom, setZoom] =
    useState(1);

  const [showReport, setShowReport] =
    useState(false);

  const [selectedStream, setSelectedStream] =
    useState(null);

  if (!current) {
    return (
      <div className="empty-builder">
        <div className="empty-state">
          <div className="big-icon">
            <GitBranch />
          </div>

          <h2>
            Pronto para construir?
          </h2>

          <p>
            Comece com uma tela vazia e adicione
            equipamentos, correntes e equações.
          </p>

          <button
            className="primary"
            onClick={createProcess}
          >
            COMEÇAR DO ZERO
          </button>
        </div>
      </div>
    );
  }

  const node =
    selected?.kind === "node"
      ? current.nodes.find(
          (n) => n.id === selected.id
        )
      : null;

  const stream =
    selected?.kind === "stream"
      ? current.streams.find(
          (s) => s.id === selected.id
        )
      : null;

  function addNode(type, name) {
    const id = crypto.randomUUID();

    const pos = {
      x: 120 + (current.nodes.length % 4) * 230,
      y:
        100 +
        Math.floor(current.nodes.length / 4) * 170
    };

    updateCurrent((p) => {
      p.nodes.push({
        id,
        type,
        name: name || "Unidade personalizada",
        ...pos
      });
    });

    setSelected({
      kind: "node",
      id
    });
  }

  function deleteNode(id) {
    updateCurrent((p) => {
      p.nodes = p.nodes.filter(
        (n) => n.id !== id
      );

      p.streams = p.streams.filter(
        (s) =>
          s.from !== id &&
          s.to !== id
      );
    });

    setSelected(null);
  }

  function addStream() {
    const id = crypto.randomUUID();

    updateCurrent((p) => {
      p.streams.push({
        id,
        name: `S${p.streams.length + 1}`,
        from: null,
        to: null,
        flow: 0,
        unit: "kg/h",
        components: {}
      });
    });

    setSelected({
      kind: "stream",
      id
    });
  }

  function deleteStream(id) {
    updateCurrent((p) => {
      p.streams = p.streams.filter(
        (s) => s.id !== id
      );
    });

    setSelected(null);
  }

  function changeNode(id, key, val) {
    updateCurrent((p) => {
      const n = p.nodes.find(
        (n) => n.id === id
      );

      if (n) {
        n[key] = val;
      }
    });
  }

  function changeStream(id, key, val) {
    updateCurrent((p) => {
      const s = p.streams.find(
        (s) => s.id === id
      );

      if (s) {
        s[key] =
          key === "flow"
            ? Number(val)
            : val;
      }
    });
  }

  function handleNodeClick(id) {
    if (connectMode) {
      if (!selectedStream) {
        setSelectedStream(id);
        notify(
          "Agora clique no equipamento de destino."
        );
      } else {
        const streamId =
          selected?.kind === "stream"
            ? selected.id
            : null;

        updateCurrent((p) => {
          const s = p.streams.find(
            (s) => s.id === streamId
          );

          if (s) {
            s.from = selectedStream;
            s.to = id;
          }
        });

        setConnectMode(false);
        setSelectedStream(null);
      }
    } else {
      setSelected({
        kind: "node",
        id
      });
    }
  }

  function addVariable() {
    updateCurrent((p) => {
      p.variables.push({
        id: crypto.randomUUID(),
        name: `x${p.variables.length + 1}`,
        value: null
      });
    });
  }

  function addEquation() {
    updateCurrent((p) => {
      p.equations.push({
        id: crypto.randomUUID(),
        name: `Equação ${p.equations.length + 1}`,
        coeffs: {},
        rhs: 0
      });
    });
  }

  function organize() {
    updateCurrent((p) => {
      p.nodes.forEach((n, i) => {
        n.x = 70 + (i % 5) * 230;
        n.y =
          100 +
          Math.floor(i / 5) * 170;
      });
    });

    notify("Fluxograma reorganizado.");
  }

  function addComponent() {
    const c = prompt(
      "Nome do novo componente:"
    );

    if (c?.trim()) {
      updateCurrent((p) => {
        if (!p.components.includes(c.trim())) {
          p.components.push(c.trim());
        }
      });
    }
  }

  function addManualVariable() {
    const name = prompt(
      "Nome da variável:"
    );

    if (name?.trim()) {
      updateCurrent((p) => {
        p.variables.push({
          id: crypto.randomUUID(),
          name: name.trim(),
          value: null
        });
      });
    }
  }

  return (
    <div className="builder-page">
      <div className="builder-head">
        <div>
          <span className="kicker">
            WORKSPACE
          </span>

          <h1>{current.name}</h1>

          <p>
            Construa o processo, defina os dados
            e acompanhe a análise em tempo real.
          </p>
        </div>

        <div className="builder-actions">
          <button
            className="icon-btn"
            title="Desfazer"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo2 size={17} />
          </button>

          <button
            className="icon-btn"
            title="Refazer"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo2 size={17} />
          </button>

          <button
            className="ghost"
            onClick={organize}
          >
            <Zap size={16} />
            Organizar
          </button>

          <button
            className="primary small"
            onClick={persistCurrent}
          >
            <Save size={16} />
            Salvar
          </button>

          <button
            className="ghost"
            onClick={() => setShowReport(true)}
          >
            <FileDown size={16} />
            Relatório
          </button>
        </div>
      </div>

      <div className="workspace">
        <aside className="toolbox">
          <div className="tool-tabs">
            <button
              className={
                activeTab === "equipamentos"
                  ? "on"
                  : ""
              }
              onClick={() =>
                setActiveTab("equipamentos")
              }
            >
              Equipamentos
            </button>

            <button
              className={
                activeTab === "dados"
                  ? "on"
                  : ""
              }
              onClick={() =>
                setActiveTab("dados")
              }
            >
              Dados
            </button>
          </div>

          {activeTab === "equipamentos" ? (
            <>
              <div className="searchbox">
                <Search size={15} />
                <input
                  placeholder="Buscar equipamento..."
                />
              </div>

              <div className="tool-list">
                {equipmentCatalog.map(
                  ([type, name, abbr]) => (
                    <button
                      key={type}
                      onClick={() =>
                        addNode(type, name)
                      }
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData(
                          "equip",
                          JSON.stringify({
                            type,
                            name
                          })
                        )
                      }
                    >
                      <span className="equip-icon">
                        {abbr}
                      </span>

                      <span>{name}</span>

                      <Plus size={14} />
                    </button>
                  )
                )}
              </div>

              <div className="tool-divider"></div>

              <button
                className="add-tool"
                onClick={addStream}
              >
                <Plus size={15} />
                Adicionar corrente
              </button>

              <button
                className={
                  connectMode
                    ? "add-tool active-tool"
                    : "add-tool"
                }
                onClick={() => {
                  setConnectMode(
                    !connectMode
                  );
                  setSelectedStream(null);
                }}
              >
                <GitBranch size={15} />

                {connectMode
                  ? "Conectando…"
                  : "Conectar corrente"}
              </button>

              <button
                className="add-tool"
                onClick={addComponent}
              >
                <Beaker size={15} />
                Novo componente
              </button>
            </>
          ) : (
            <>
              <div className="data-block">
                <h4>Variáveis</h4>

                <button onClick={addVariable}>
                  <Plus size={14} />
                  Adicionar variável
                </button>

                {current.variables.map(
                  (v) => (
                    <div
                      className="mini-row"
                      key={v.id}
                    >
                      <span>{v.name}</span>

                      <input
                        value={v.value ?? ""}
                        placeholder="valor"
                        onChange={(e) =>
                          updateCurrent((p) => {
                            const x =
                              p.variables.find(
                                (z) =>
                                  z.id === v.id
                              );

                            if (x) {
                              x.value =
                                e.target.value === ""
                                  ? null
                                  : Number(
                                      e.target.value
                                    );
                            }
                          })
                        }
                      />

                      <button
                        onClick={() =>
                          updateCurrent((p) => {
                            p.variables =
                              p.variables.filter(
                                (x) =>
                                  x.id !== v.id
                              );
                          })
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                )}
              </div>

              <div className="data-block">
                <h4>Equações</h4>

                <button onClick={addEquation}>
                  <Plus size={14} />
                  Adicionar equação
                </button>

                {current.equations.map(
                  (eq, i) => (
                    <div
                      className="eq-mini"
                      key={eq.id}
                    >
                      <input
                        value={eq.name}
                        onChange={(e) =>
                          updateCurrent((p) => {
                            p.equations[i].name =
                              e.target.value;
                          })
                        }
                      />

                      <div className="eq-preview">
                        {current.variables.map(
                          (v) => (
                            <input
                              key={v.id}
                              className="coeff"
                              placeholder="0"
                              value={
                                eq.coeffs?.[v.id] ??
                                ""
                              }
                              onChange={(e) =>
                                updateCurrent(
                                  (p) => {
                                    p.equations[
                                      i
                                    ].coeffs[
                                      v.id
                                    ] = Number(
                                      e.target.value ||
                                        0
                                    );
                                  }
                                )
                              }
                            />
                          )
                        )}

                        <span>=</span>

                        <input
                          className="rhs"
                          value={eq.rhs}
                          onChange={(e) =>
                            updateCurrent((p) => {
                              p.equations[i].rhs =
                                Number(
                                  e.target.value ||
                                    0
                                );
                            })
                          }
                        />
                      </div>

                      <button
                        className="delete-eq"
                        onClick={() =>
                          updateCurrent((p) => {
                            p.equations =
                              p.equations.filter(
                                (x) =>
                                  x.id !== eq.id
                              );
                          })
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                )}
              </div>

              <button
                className="add-tool"
                onClick={addManualVariable}
              >
                <Plus size={15} />
                Variável personalizada
              </button>
            </>
          )}
        </aside>

        <section
          className="canvas-wrap"
          onDragOver={(e) =>
            e.preventDefault()
          }
          onDrop={(e) => {
            const raw =
              e.dataTransfer.getData(
                "equip"
              );

            if (raw) {
              const d = JSON.parse(raw);
              addNode(d.type, d.name);
            }
          }}
        >
          <div className="canvas-toolbar">
            <span className="canvas-label">
              <Move size={14} />
              Área de construção
            </span>

            <div>
              <button
                onClick={() =>
                  setZoom((z) =>
                    Math.max(0.65, z - 0.1)
                  )
                }
              >
                −
              </button>

              <span>
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={() =>
                  setZoom((z) =>
                    Math.min(1.5, z + 0.1)
                  )
                }
              >
                +
              </button>

              <button
                onClick={() =>
                  setZoom(1)
                }
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div
            className="canvas"
            style={{
              "--zoom": zoom
            }}
          >
            <svg
              className="connections"
              viewBox="0 0 1400 650"
              preserveAspectRatio="none"
            >
              <defs>
                <marker
                  id="arrow"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                >
                  <path d="M0,0 L10,5 L0,10 z" />
                </marker>
              </defs>

              {current.streams.map((s) => {
                const a =
                  current.nodes.find(
                    (n) => n.id === s.from
                  );

                const b =
                  current.nodes.find(
                    (n) => n.id === s.to
                  );

                if (!a) {
                  return null;
                }

                const x1 = a.x + 145;
                const y1 = a.y + 45;

                const x2 = b
                  ? b.x
                  : x1 + 130;

                const y2 = b
                  ? b.y + 45
                  : y1;

                return (
                  <g
                    key={s.id}
                    className={
                      selected?.id === s.id
                        ? "selected-line"
                        : ""
                    }
                    onClick={() =>
                      setSelected({
                        kind: "stream",
                        id: s.id
                      })
                    }
                  >
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      markerEnd="url(#arrow)"
                    />

                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 10}
                    >
                      {s.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="canvas-empty-hint">
              {current.nodes.length === 0 && (
                <>
                  <div>
                    <GitBranch size={28} />
                  </div>

                  <b>
                    Solte equipamentos aqui
                  </b>

                  <span>
                    ou use a biblioteca à esquerda
                  </span>
                </>
              )}
            </div>

            {current.nodes.map((n) => (
              <div
                key={n.id}
                className={
                  selected?.id === n.id
                    ? "process-node selected"
                    : "process-node"
                }
                style={{
                  left: n.x,
                  top: n.y
                }}
                onClick={() =>
                  handleNodeClick(n.id)
                }
                onDoubleClick={() =>
                  changeNode(
                    n.id,
                    "name",
                    prompt(
                      "Nome do equipamento:",
                      n.name
                    ) || n.name
                  )
                }
              >
                <div className="node-code">
                  {n.type
                    ?.slice(0, 3)
                    .toUpperCase()}
                </div>

                <div className="node-symbol">
                  <div className="node-shape"></div>
                </div>

                <strong>{n.name}</strong>

                <small>
                  {
                    current.streams.filter(
                      (s) =>
                        s.from === n.id ||
                        s.to === n.id
                    ).length
                  }{" "}
                  conexões
                </small>

                {selected?.id === n.id && (
                  <button
                    className="node-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(n.id);
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="canvas-foot">
            <span>
              {current.nodes.length} equipamentos
            </span>

            <span>
              {current.streams.length} correntes
            </span>

            <span>
              {current.components.length} componentes
            </span>
          </div>
        </section>

        <aside className="properties">
          <div className="properties-title">
            <div>
              <span className="kicker">
                PROPRIEDADES
              </span>

              <h3>
                {node
                  ? node.name
                  : stream
                  ? stream.name
                  : "Visão geral"}
              </h3>
            </div>

            <PanelRight size={18} />
          </div>

          {node ? (
            <NodeProperties
              node={node}
              change={changeNode}
            />
          ) : stream ? (
            <StreamProperties
              stream={stream}
              current={current}
              change={changeStream}
              updateCurrent={updateCurrent}
              deleteStream={deleteStream}
            />
          ) : (
            <Overview
              current={current}
              analysis={analysis}
            />
          )}
        </aside>
      </div>

      <div className="result-bar">
        <div>
          <span>
            Variáveis desconhecidas
          </span>

          <b>{analysis.n}</b>
        </div>

        <div>
          <span>
            Equações independentes
          </span>

          <b>{analysis.rankA}</b>
        </div>

        <div>
          <span>
            Grau de liberdade
          </span>

          <b
            className={
              analysis.dof === 0
                ? "good"
                : analysis.dof > 0
                ? "warn"
                : "bad"
            }
          >
            {analysis.dof}
          </b>
        </div>

        <div className="status">
          <span>Status</span>

          <b
            className={
              analysis.kind === "unique"
                ? "good"
                : analysis.kind === "infinite"
                ? "warn"
                : "bad"
            }
          >
            {analysis.status}
          </b>
        </div>

        <div className="solution-summary">
          {solution?.type === "unique" ? (
            <>
              <CheckCircle2 size={16} />
              Solução única calculada
            </>
          ) : solution?.type === "parametric" ? (
            <>
              <Info size={16} />
              Existem variáveis livres
            </>
          ) : solution?.type === "none" ? (
            <>
              <X size={16} />
              Dados inconsistentes
            </>
          ) : (
            <>Adicione variáveis e equações</>
          )}
        </div>
      </div>

      {showReport && (
        <ReportModal
          current={current}
          analysis={analysis}
          solution={solution}
          close={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

function NodeProperties({
  node,
  change
}) {
  return (
    <div className="prop-body">
      <label>
        Nome do equipamento

        <input
          value={node.name}
          onChange={(e) =>
            change(
              node.id,
              "name",
              e.target.value
            )
          }
        />
      </label>

      <label>
        Tipo

        <input
          value={node.type}
          onChange={(e) =>
            change(
              node.id,
              "type",
              e.target.value
            )
          }
        />
      </label>

      <div className="prop-grid">
        <label>
          Posição X

          <input
            type="number"
            value={node.x}
            onChange={(e) =>
              change(
                node.id,
                "x",
                Number(e.target.value)
              )
            }
          />
        </label>

        <label>
          Posição Y

          <input
            type="number"
            value={node.y}
            onChange={(e) =>
              change(
                node.id,
                "y",
                Number(e.target.value)
              )
            }
          />
        </label>
      </div>

      <div className="info-card">
        <Settings2 size={16} />

        <span>
          Duplo clique no bloco também permite
          renomeá-lo.
        </span>
      </div>
    </div>
  );
}

function StreamProperties({
  stream,
  current,
  change,
  updateCurrent,
  deleteStream
}) {
  return (
    <div className="prop-body">
      <label>
        Nome da corrente

        <input
          value={stream.name}
          onChange={(e) =>
            change(
              stream.id,
              "name",
              e.target.value
            )
          }
        />
      </label>

      <div className="prop-grid">
        <label>
          Vazão

          <input
            type="number"
            value={stream.flow}
            onChange={(e) =>
              change(
                stream.id,
                "flow",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Unidade

          <select
            value={stream.unit}
            onChange={(e) =>
              change(
                stream.id,
                "unit",
                e.target.value
              )
            }
          >
            {Object.keys(unitFactors).map(
              (u) => (
                <option key={u}>
                  {u}
                </option>
              )
            )}
          </select>
        </label>
      </div>

      <div className="conversion-card">
        <span>Base interna</span>

        <b>
          {fmt(
            stream.flow *
              unitFactors[stream.unit]
          )}{" "}
          kg/h*
        </b>

        <small>
          * fator didático de conversão; valide
          a grandeza antes de misturar unidades.
        </small>
      </div>

      <h4 className="prop-section">
        Componentes
      </h4>

      {current.components.map((c) => (
        <div
          className="component-row"
          key={c}
        >
          <span>{c}</span>

          <input
            type="number"
            placeholder="kg/h"
            value={
              stream.components?.[c] ?? ""
            }
            onChange={(e) =>
              updateCurrent((p) => {
                const s =
                  p.streams.find(
                    (x) =>
                      x.id === stream.id
                  );

                if (s) {
                  s.components = {
                    ...s.components,
                    [c]: Number(
                      e.target.value || 0
                    )
                  };
                }
              })
            }
          />
        </div>
      ))}

      <button
        className="danger-outline"
        onClick={() =>
          deleteStream(stream.id)
        }
      >
        <Trash2 size={15} />
        Excluir corrente
      </button>
    </div>
  );
}

function Overview({
  current,
  analysis
}) {
  return (
    <div className="overview">
      <div className="overview-card">
        <span>Equipamentos</span>
        <b>{current.nodes.length}</b>
      </div>

      <div className="overview-card">
        <span>Correntes</span>
        <b>{current.streams.length}</b>
      </div>

      <div className="overview-card">
        <span>Componentes</span>
        <b>{current.components.length}</b>
      </div>

      <div className="analysis-box">
        <div className="analysis-head">
          <Gauge size={17} />
          <b>Análise do sistema</b>
        </div>

        <p>
          {analysis.dof > 0
            ? `Você possui ${analysis.dof} grau(s) de liberdade. Adicione informação independente para determinar uma solução única.`
            : analysis.kind === "unique"
            ? "O sistema está determinado e possui solução única."
            : analysis.kind === "none"
            ? "Os dados apresentam uma inconsistência."
            : "Verifique as equações e variáveis."}
        </p>
      </div>

      <div className="hint-list">
        <div>
          <CheckCircle2 size={15} />
          Conservação de massa
        </div>

        <div>
          <CheckCircle2 size={15} />
          Validação matricial
        </div>

        <div>
          <CheckCircle2 size={15} />
          Análise de posto
        </div>
      </div>
    </div>
  );
}

function Processes({
  processes,
  onOpen,
  onDuplicate,
  onDelete,
  onCreate
}) {
  return (
    <div className="page content-page">
      <div className="page-head">
        <div>
          <span className="kicker">
            ARQUIVO LOCAL
          </span>

          <h1>Meus Processos</h1>

          <p>
            Seus projetos ficam salvos no navegador
            para o protótipo.
          </p>
        </div>

        <button
          className="primary"
          onClick={onCreate}
        >
          <Plus size={17} />
          Novo processo
        </button>
      </div>

      {processes.length === 0 ? (
        <div className="empty-card">
          <Database size={30} />

          <h3>
            Nenhum processo salvo
          </h3>

          <p>
            Crie um processo e use “Salvar”
            para armazená-lo localmente.
          </p>
        </div>
      ) : (
        <div className="process-grid">
          {processes.map((p) => (
            <div
              className="saved-card"
              key={p.id}
            >
              <div className="saved-icon">
                <GitBranch />
              </div>

              <div>
                <h3>{p.name}</h3>

                <p>
                  Atualizado em{" "}
                  {new Date(
                    p.updatedAt
                  ).toLocaleString("pt-BR")}
                </p>

                <div className="saved-stats">
                  <span>
                    {p.nodes.length} equipamentos
                  </span>

                  <span>
                    {p.streams.length} correntes
                  </span>
                </div>
              </div>

              <div className="saved-actions">
                <button
                  onClick={() =>
                    onOpen(p)
                  }
                >
                  Abrir
                </button>

                <button
                  onClick={() =>
                    onDuplicate(p)
                  }
                  title="Duplicar"
                >
                  <Copy size={15} />
                </button>

                <button
                  onClick={() =>
                    onDelete(p.id)
                  }
                  title="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Examples({ onOpen }) {
  const ex = [
    beerExample,

    {
      ...newProcess(
        "Tratamento de água — exemplo"
      ),

      nodes: [
        {
          id: "a",
          type: "tratamento",
          name: "Coagulação",
          x: 80,
          y: 180
        },
        {
          id: "b",
          type: "filtro",
          name: "Filtração",
          x: 360,
          y: 180
        },
        {
          id: "c",
          type: "tratamento",
          name: "Desinfecção",
          x: 640,
          y: 180
        },
        {
          id: "d",
          type: "produto",
          name: "Água tratada",
          x: 920,
          y: 180
        }
      ],

      streams: [
        {
          id: "x",
          name: "Água bruta",
          from: "a",
          to: "b",
          flow: 2000,
          unit: "kg/h",
          components: {
            Água: 1900,
            Sólidos: 100
          }
        },
        {
          id: "y",
          name: "Filtrado",
          from: "b",
          to: "c",
          flow: 1850,
          unit: "kg/h",
          components: {
            Água: 1840,
            Sólidos: 10
          }
        },
        {
          id: "z",
          name: "Lodo",
          from: "b",
          to: null,
          flow: 150,
          unit: "kg/h",
          components: {
            Sólidos: 90
          }
        }
      ]
    },

    {
      ...newProcess(
        "Mistura e separação — exemplo"
      ),

      nodes: [
        {
          id: "m1",
          type: "misturador",
          name: "Misturador",
          x: 180,
          y: 130
        },
        {
          id: "m2",
          type: "separador",
          name: "Separador",
          x: 500,
          y: 230
        },
        {
          id: "m3",
          type: "produto",
          name: "Produto A",
          x: 850,
          y: 130
        },
        {
          id: "m4",
          type: "purga",
          name: "Resíduo",
          x: 850,
          y: 350
        }
      ],

      streams: [
        {
          id: "i1",
          name: "Alimentação 1",
          from: null,
          to: "m1",
          flow: 500,
          unit: "kg/h",
          components: {
            Água: 400,
            Açúcar: 100
          }
        },
        {
          id: "i2",
          name: "Alimentação 2",
          from: null,
          to: "m1",
          flow: 300,
          unit: "kg/h",
          components: {
            Água: 200,
            Etanol: 100
          }
        },
        {
          id: "i3",
          name: "Saída principal",
          from: "m1",
          to: "m2",
          flow: 750,
          unit: "kg/h",
          components: {
            Água: 560,
            Açúcar: 100,
            Etanol: 90
          }
        },
        {
          id: "i4",
          name: "Produto",
          from: "m2",
          to: "m3",
          flow: 680,
          unit: "kg/h",
          components: {
            Água: 520,
            Açúcar: 90,
            Etanol: 70
          }
        },
        {
          id: "i5",
          name: "Resíduo",
          from: "m2",
          to: "m4",
          flow: 70,
          unit: "kg/h",
          components: {
            Água: 40,
            Açúcar: 10,
            Etanol: 20
          }
        }
      ]
    }
  ];

  return (
    <div className="page content-page">
      <div className="page-head">
        <div>
          <span className="kicker">
            CASOS DE ESTUDO
          </span>

          <h1>Exemplos</h1>

          <p>
            Abra, altere os dados e experimente
            diferentes cenários.
          </p>
        </div>
      </div>

      <div className="example-grid">
        {ex.map((p, i) => (
          <div
            className="example-card"
            key={p.id}
          >
            <div className="example-visual">
              <div className="example-flow">
                <span></span>
                <i></i>
                <span></span>
                <i></i>
                <span></span>
              </div>

              <small>
                EXEMPLO{" "}
                {String(i + 1).padStart(2, "0")}
              </small>
            </div>

            <div className="example-body">
              <h3>{p.name}</h3>

              <p>
                {i === 0
                  ? "Matérias-primas → Mosturação → Filtração → Fervura → Fermentação → Cerveja"
                  : "Um cenário aberto para estudar entradas, separações e perdas materiais."}
              </p>

              <button
                className="secondary small"
                onClick={() => onOpen(p)}
              >
                ABRIR EXEMPLO
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalculatorPage() {
  const [mode, setMode] =
    useState("massa");

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [u, setU] =
    useState("kg/h");

  const [result, setResult] =
    useState(null);

  function calc() {
    const x = Number(a);
    const y = Number(b);

    if (mode === "fracao") {
      setResult(
        x && y
          ? x / y
          : null
      );

      return;
    }

    if (mode === "massa") {
      setResult(
        x * y / 100
      );

      return;
    }

    if (mode === "conversao") {
      setResult(
        Number(a) *
          unitFactors[u]
      );

      return;
    }

    if (mode === "mistura") {
      setResult(x + y);
    }
  }

  return (
    <div className="page content-page">
      <div className="page-head">
        <div>
          <span className="kicker">
            FERRAMENTAS
          </span>

          <h1>Calculadora</h1>

          <p>
            Cálculos independentes do fluxograma
            para apoiar seus estudos.
          </p>
        </div>
      </div>

      <div className="calculator-shell">
        <div className="calc-menu">
          {[
            ["massa", "Massa por composição"],
            ["fracao", "Fração"],
            ["conversao", "Conversão"],
            ["mistura", "Mistura"]
          ].map(([id, t]) => (
            <button
              className={
                mode === id
                  ? "selected"
                  : ""
              }
              onClick={() => {
                setMode(id);
                setResult(null);
              }}
              key={id}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="calc-main">
          <div className="calc-form">
            <h2>
              {mode === "massa"
                ? "Massa do componente"
                : mode === "fracao"
                ? "Fração de uma corrente"
                : mode === "conversao"
                ? "Conversão para base kg/h"
                : "Soma de vazões"}
            </h2>

            {mode === "massa" && (
              <>
                <label>
                  Vazão total (kg/h)

                  <input
                    type="number"
                    value={a}
                    onChange={(e) =>
                      setA(e.target.value)
                    }
                    placeholder="1000"
                  />
                </label>

                <label>
                  Fração mássica (%)

                  <input
                    type="number"
                    value={b}
                    onChange={(e) =>
                      setB(e.target.value)
                    }
                    placeholder="80"
                  />
                </label>
              </>
            )}

            {mode === "fracao" && (
              <>
                <label>
                  Massa do componente

                  <input
                    type="number"
                    value={a}
                    onChange={(e) =>
                      setA(e.target.value)
                    }
                  />
                </label>

                <label>
                  Massa total

                  <input
                    type="number"
                    value={b}
                    onChange={(e) =>
                      setB(e.target.value)
                    }
                  />
                </label>
              </>
            )}

            {mode === "conversao" && (
              <>
                <label>
                  Valor

                  <input
                    type="number"
                    value={a}
                    onChange={(e) =>
                      setA(e.target.value)
                    }
                  />
                </label>

                <label>
                  Unidade

                  <select
                    value={u}
                    onChange={(e) =>
                      setU(e.target.value)
                    }
                  >
                    {Object.keys(
                      unitFactors
                    ).map((x) => (
                      <option key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            {mode === "mistura" && (
              <>
                <label>
                  Vazão 1

                  <input
                    type="number"
                    value={a}
                    onChange={(e) =>
                      setA(e.target.value)
                    }
                  />
                </label>

                <label>
                  Vazão 2

                  <input
                    type="number"
                    value={b}
                    onChange={(e) =>
                      setB(e.target.value)
                    }
                  />
                </label>
              </>
            )}

            <button
              className="primary"
              onClick={calc}
            >
              <Calculator size={16} />
              Calcular
            </button>
          </div>

          <div className="calc-result">
            <span>RESULTADO</span>

            <b>
              {result === null
                ? "—"
                : fmt(result)}
            </b>

            <small>
              {mode === "massa"
                ? "kg/h"
                : mode === "fracao"
                ? "fração"
                : mode === "conversao"
                ? "kg/h"
                : "unidade de vazão"}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

function Challenges({ onOpen }) {
  return (
    <div className="page content-page">
      <div className="page-head">
        <div>
          <span className="kicker">
            PRÁTICA
          </span>

          <h1>Desafios</h1>

          <p>
            Construa o fluxograma, determine as
            incógnitas e confira a análise.
          </p>
        </div>
      </div>

      <div className="challenge-list">
        <Challenge
          n="01"
          title="Balanço em uma separação"
          text="Uma indústria recebe 1.000 kg/h de matéria-prima contendo 80% de água e 20% de sólido. Após o processo, parte da água é removida."
          level="Básico"
          onOpen={onOpen}
        />

        <Challenge
          n="02"
          title="Mistura com duas alimentações"
          text="Duas correntes são combinadas em uma unidade de mistura. Determine a vazão e a composição da saída."
          level="Intermediário"
          onOpen={onOpen}
        />

        <Challenge
          n="03"
          title="Reciclo e purga"
          text="Um processo possui uma corrente de reciclo e uma purga. Analise os graus de liberdade antes de resolver."
          level="Avançado"
          onOpen={onOpen}
        />
      </div>
    </div>
  );
}

function Challenge({
  n,
  title,
  text,
  level,
  onOpen
}) {
  return (
    <div className="challenge">
      <div className="challenge-num">
        {n}
      </div>

      <div className="challenge-copy">
        <div>
          <span className="pill">
            {level}
          </span>

          <h3>{title}</h3>
        </div>

        <p>{text}</p>

        <button
          className="secondary small"
          onClick={() =>
            onOpen(
              newProcess(
                `Desafio ${n} — ${title}`
              )
            )
          }
        >
          ABRIR DESAFIO
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="challenge-icon">
        <ClipboardList />
      </div>
    </div>
  );
}

function Sustainability({ current }) {
  const p = current;
  const streams = p?.streams || [];

  const totalIn = streams
    .filter((s) => !s.from)
    .reduce(
      (a, s) =>
        a + Number(s.flow || 0),
      0
    );

  const totalOut = streams
    .filter((s) => !s.to)
    .reduce(
      (a, s) =>
        a + Number(s.flow || 0),
      0
    );

  const residual = streams
    .filter((s) => !s.to)
    .reduce(
      (a, s) =>
        a + Number(s.flow || 0),
      0
    );

  const product = streams
    .filter(
      (s) =>
        !s.to &&
        !/res|perd|baga|lodo|levedura/i.test(
          s.name
        )
    )
    .reduce(
      (a, s) =>
        a + Number(s.flow || 0),
      0
    );

  const loss = Math.max(
    0,
    residual - product
  );

  const aprove =
    totalIn
      ? (product / totalIn) * 100
      : 0;

  return (
    <div className="page content-page">
      <div className="page-head">
        <div>
          <span className="kicker">
            EFICIÊNCIA MATERIAL
          </span>

          <h1>
            Análise de Sustentabilidade
          </h1>

          <p>
            Indicadores de eficiência material
            derivados das correntes classificadas.
            Isto não é uma Avaliação de Ciclo de
            Vida completa.
          </p>
        </div>
      </div>

      <div className="sustain-banner">
        <div>
          <Leaf size={24} />

          <div>
            <b>
              {p
                ? `Processo analisado: ${p.name}`
                : "Nenhum processo selecionado"}
            </b>

            <p>
              Abra um processo no Criar Processo
              para usar seus dados.
            </p>
          </div>
        </div>
      </div>

      <div className="sustain-grid">
        <Metric
          title="Massa total de entrada"
          value={totalIn}
          unit="kg/h"
          icon={ArrowDown}
        />

        <Metric
          title="Massa total de produto"
          value={product}
          unit="kg/h"
          icon={Package}
        />

        <Metric
          title="Massa de resíduos/perdas"
          value={loss}
          unit="kg/h"
          icon={Trash2}
        />

        <Metric
          title="Aproveitamento material"
          value={aprove}
          unit="%"
          icon={Leaf}
        />
      </div>

      <div className="interpretation">
        <Info />

        <div>
          <b>Interpretação</b>

          <p>
            {loss > 0
              ? "Este processo apresenta perdas materiais que podem ser avaliadas para possíveis estratégias de redução ou reaproveitamento."
              : "Não foram identificadas perdas classificadas no cenário atual; revise a classificação das correntes para uma leitura mais detalhada."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
  unit,
  icon: Icon
}) {
  return (
    <div className="metric">
      <div className="metric-icon">
        <Icon size={19} />
      </div>

      <span>{title}</span>

      <b>
        {fmt(value)}{" "}
        <small>{unit}</small>
      </b>
    </div>
  );
}

function Assistant() {
  return (
    <div className="page content-page">
      <div className="page-head">
        <div>
          <span className="kicker">
            FUTURA INTEGRAÇÃO
          </span>

          <h1>
            Assistente Balanço Verde
          </h1>

          <p>
            Um espaço preparado para uma IA
            especializada, sem simular uma
            inteligência que ainda não está
            conectada.
          </p>
        </div>
      </div>

      <div className="ai-ready">
        <div className="ai-orb">
          <Sparkles />
        </div>

        <div>
          <h2>
            IA preparada para integração
          </h2>

          <p>
            Quando uma API confiável for
            conectada, o assistente poderá
            analisar o processo atual, explicar
            balanços passo a passo, interpretar
            graus de liberdade e apontar
            informações faltantes.
          </p>

          <div className="ai-tags">
            <span>Balanço de massa</span>
            <span>Grau de liberdade</span>
            <span>Sistemas lineares</span>
            <span>Sustentabilidade</span>
            <span>Processos industriais</span>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        <Feature
          icon={ShieldCheck}
          title="Sem chat decorativo"
          text="A interface não afirma que existe uma IA funcionando quando a integração ainda não foi feita."
        />

        <Feature
          icon={Database}
          title="Contexto do processo"
          text="A arquitetura já separa o modelo do processo, deixando espaço para enviar variáveis e resultados a uma futura API."
        />

        <Feature
          icon={Zap}
          title="Pronta para evolução"
          text="O núcleo de cálculos permanece local e independente da camada de IA."
        />
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="page content-page">
      <div className="about-hero">
        <div>
          <span className="kicker">
            SOBRE O PROJETO
          </span>

          <h1>
            Sobre o Balanço Verde
          </h1>

          <p>
            Uma plataforma digital criada para
            integrar química, engenharia de
            processos, balanço de massa e
            sustentabilidade em um ambiente
            interativo.
          </p>
        </div>

        <div className="about-emblem">
          <Leaf size={42} />
        </div>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <h3>Propósito</h3>

          <p>
            Transformar conceitos de balanço de
            massa em uma experiência visual e
            prática, permitindo que o estudante
            ou profissional construa processos,
            teste hipóteses e compreenda os
            resultados.
          </p>
        </div>

        <div className="about-card">
          <h3>Base científica</h3>

          <p>
            O protótipo prioriza sistemas
            lineares, análise de posto,
            consistência de matrizes e
            conservação de massa, com arquitetura
            preparada para futuras extensões.
          </p>
        </div>

        <div className="about-card">
          <h3>Eficiência material</h3>

          <p>
            Os indicadores de sustentabilidade
            usam as próprias correntes do processo
            para ajudar a visualizar produtos,
            subprodutos, resíduos e perdas.
          </p>
        </div>
      </div>

      <div className="team-card">
        <div>
          <span className="kicker">
            DESENVOLVIMENTO
          </span>

          <h2>
            Uma iniciativa construída por
          </h2>
        </div>

        <div className="team-members">
          <div>
            <div className="avatar">
              B
            </div>

            <b>
              Bruna Isabelly Gouveia Montenegro
            </b>

            <span>
              Desenvolvimento
            </span>
          </div>

          <div>
            <div className="avatar">
              A
            </div>

            <b>
              Andrey Oliveira de Souza
            </b>

            <span>
              Desenvolvimento
            </span>
          </div>

          <div className="partner">
            <img
              src="/ifpb-logo.png"
              alt="IFPB Campus Campina Grande"
            />

            <b>Parceria</b>

            <span>
              IFPB — Campus Campina Grande
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportModal({
  current,
  analysis,
  solution,
  close
}) {
  function print() {
    window.print();
  }

  return (
    <div className="modal-backdrop">
      <div className="report-modal">
        <div className="modal-head">
          <div>
            <span className="kicker">
              RELATÓRIO
            </span>

            <h2>{current.name}</h2>
          </div>

          <button onClick={close}>
            <X />
          </button>
        </div>

        <div className="report-body">
          <div className="report-grid">
            <div>
              <span>Equipamentos</span>
              <b>{current.nodes.length}</b>
            </div>

            <div>
              <span>Correntes</span>
              <b>{current.streams.length}</b>
            </div>

            <div>
              <span>Variáveis</span>
              <b>{analysis.n}</b>
            </div>

            <div>
              <span>Grau de liberdade</span>
              <b>{analysis.dof}</b>
            </div>
          </div>

          <h3>Classificação</h3>

          <p>
            {analysis.status}.{" "}
            {analysis.kind === "unique"
              ? "O sistema possui solução única."
              : analysis.kind === "infinite"
              ? "Existem variáveis livres."
              : "Revise a consistência das informações."}
          </p>

          <h3>Correntes</h3>

          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Vazão</th>
                <th>Unidade</th>
              </tr>
            </thead>

            <tbody>
              {current.streams.map(
                (s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{fmt(s.flow)}</td>
                    <td>{s.unit}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <button
            className="secondary"
            onClick={close}
          >
            Fechar
          </button>

          <button
            className="primary"
            onClick={print}
          >
            <FileDown size={16} />
            Imprimir / salvar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);