import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

const SECTIONS = [
  { id: "about", num: "01", label: "About" },
  { id: "school", num: "02", label: "School" },
  { id: "roots", num: "03", label: "Roots" },
  { id: "later", num: "04", label: "Later" },
  { id: "close", num: "05", label: "Close" },
];

const PLACES = [
  {
    id: "tanza",
    label: "Tanza",
    note: "The municipality I'm from. It sits on the south shore of Manila Bay, on the western side of Cavite.",
  },
  {
    id: "cavite",
    label: "Cavite",
    note: "The province. Tanza is one of its towns, south of Manila.",
  },
  {
    id: "philippines",
    label: "Philippines",
    note: "The country those two belong to. The widest ring of home.",
  },
];

const FRAMES = [
  {
    id: "schoolwork",
    num: "01",
    label: "For school",
    detail: "Empty on purpose. Class work goes here only after I've actually made it.",
  },
  {
    id: "own",
    num: "02",
    label: "On my own",
    detail: "Empty on purpose. Something I build because I want to, not a stand-in.",
  },
  {
    id: "explain",
    num: "03",
    label: "In plain words",
    detail: "Empty on purpose. A project I can explain honestly, once it exists.",
  },
];

function ManilaClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const formatted = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(now);

  return (
    <p className="clock">
      <span>Time in Tanza</span>
      <time dateTime={now.toISOString()}>{formatted}</time>
    </p>
  );
}

function useDarkSurface() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const read = () => {
      const el = document.elementFromPoint(window.innerWidth / 2, 88);
      const surface = el?.closest("[data-surface]")?.dataset.surface;
      if (surface) setDark(surface === "dark");
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  return dark;
}

function useActiveSection() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const nodes = SECTIONS.map((section) => document.getElementById(section.id)).filter(Boolean);
    const ratios = new Map();

    const pick = () => {
      let bestId = "";
      let best = 0;
      ratios.forEach((ratio, id) => {
        if (ratio > best) {
          best = ratio;
          bestId = id;
        }
      });
      if (bestId) setActive(bestId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        pick();
      },
      { rootMargin: "-20% 0px -35% 0px", threshold: [0.1, 0.2, 0.45, 0.7] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return active;
}

function MarginRule() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="margin-rule"
      aria-hidden="true"
      initial={reduce ? false : { scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={reduce ? { duration: 0 } : { duration: 1.15, ease: EASE }}
    />
  );
}

function Reveal({ children, className, delay = 0 }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Progress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: reduce ? 700 : 80,
    damping: reduce ? 80 : 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="progress"
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
      aria-hidden="true"
    />
  );
}

function MaskLine({ children, delay }) {
  const reduce = useReducedMotion();

  return (
    <span className="mask-line">
      <motion.span
        initial={reduce ? false : { y: "115%" }}
        animate={{ y: "0%" }}
        transition={reduce ? { duration: 0 } : { duration: 1.05, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function IndexLinks({ active, onNavigate, className }) {
  return (
    <ul className={className}>
      {SECTIONS.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            aria-current={active === section.id ? "true" : undefined}
            onClick={onNavigate}
          >
            <span className="num">{section.num}</span>
            <span className="label">{section.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Chrome({ dark, active }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const tone = dark ? "is-dark" : "is-light";

  return (
    <>
      <a className={`mark ${tone}`} href="#top">
        P.K.O.
      </a>
      <p className={`place-tag ${tone}`}>Tanza, Cavite</p>
      <nav className={`rail ${tone}`} aria-label="Sections">
        <IndexLinks active={active} className="rail-list" />
      </nav>

      <header className={`topbar ${tone} ${open ? "is-open" : ""}`}>
        <a className="topbar-mark" href="#top" onClick={() => setOpen(false)}>
          Prince Kyle
        </a>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-index"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Index"}
        </button>
        <nav id="mobile-index" aria-label="Sections" hidden={!open}>
          <IndexLinks
            active={active}
            className="mobile-list"
            onNavigate={() => setOpen(false)}
          />
        </nav>
        {open ? <p className="menu-foot">18 · Tanza, Cavite</p> : null}
      </header>
    </>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const sunY = useTransform(scrollY, [0, 700], [0, reduce ? 0 : -70]);
  const fade = {
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <header className="hero" id="top" data-surface="dark">
      <div className="hero-sky" aria-hidden="true">
        <motion.div className="sun" style={{ y: sunY }} />
        <svg className="grain" aria-hidden="true">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      <div className="hero-inner">
        <motion.div
          className="hero-meta"
          initial={fade.initial}
          animate={fade.animate}
          transition={reduce ? { duration: 0 } : { duration: 0.8, delay: 0.15, ease: EASE }}
        >
          <p>Student page</p>
          <ManilaClock />
        </motion.div>

        <div className="hero-main">
          <h1 className="name">
            <MaskLine delay={0.12}>Prince</MaskLine>
            <MaskLine delay={0.24}>Kyle</MaskLine>
            <MaskLine delay={0.36}>
              <em>Ortiz</em>
            </MaskLine>
          </h1>
          <motion.p
            className="dek"
            initial={fade.initial}
            animate={fade.animate}
            transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.62, ease: EASE }}
          >
            Eighteen, from Tanza, Cavite, in the Philippines. Studying at Granby College of
            Science and Technology.
          </motion.p>
          <motion.ul
            className="facts"
            initial={fade.initial}
            animate={fade.animate}
            transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.78, ease: EASE }}
          >
            <li>
              <span>Age</span>
              18
            </li>
            <li>
              <span>From</span>
              Tanza, Cavite
            </li>
            <li>
              <span>School</span>
              Granby College of Science and Technology
            </li>
          </motion.ul>
        </div>
      </div>

      <div className="shore" aria-hidden="true">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none">
          <path
            fill="#f3eee4"
            d="M0 96C220 108 300 42 500 54C760 70 820 128 1060 114C1240 104 1320 52 1440 66V160H0Z"
          />
          <path
            className="shore-stroke"
            fill="none"
            stroke="#f6d2bc"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            d="M0 96C220 108 300 42 500 54C760 70 820 128 1060 114C1240 104 1320 52 1440 66"
          />
        </svg>
      </div>
    </header>
  );
}

function About() {
  return (
    <section id="about" className="block">
      <Reveal>
        <p className="kicker">
          <span>01</span> About
        </p>
        <h2>I'm eighteen, and I'm still in school.</h2>
      </Reveal>
      <div className="split">
        <Reveal>
          <div className="prose">
            <p>
              I'm Prince Kyle Ortiz. Home is Tanza, Cavite — a coastal town on Manila Bay — and
              the school I attend is Granby College of Science and Technology.
            </p>
            <p>
              I wanted a page that sounds like me talking, not like a company introducing an
              employee. I'm a student. That's the work in front of me. Projects and job titles
              can wait until they're real.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <dl className="sidecard">
            <div>
              <dt>Age</dt>
              <dd>18</dd>
            </div>
            <div>
              <dt>From</dt>
              <dd>Tanza, Cavite, Philippines</dd>
            </div>
            <div>
              <dt>School</dt>
              <dd>Granby College of Science and Technology</dd>
            </div>
            <div>
              <dt>Standing</dt>
              <dd>Student</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function Education() {
  return (
    <section id="school" className="block">
      <Reveal>
        <p className="kicker">
          <span>02</span> School
        </p>
        <h2 className="school-title">Granby College of Science and Technology</h2>
        <p className="standing">Student</p>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="prose prose-wide">
          <p>
            This is my school. I'm a student at Granby College of Science and Technology, which
            means I'm in the middle of the learning — not writing up a career I haven't had.
          </p>
          <p>
            Most of my days right now are school days. I'm paying attention, and I'm letting
            that be enough to say.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function Roots() {
  const reduce = useReducedMotion();
  const [placeId, setPlaceId] = useState("tanza");
  const place = PLACES.find((item) => item.id === placeId) ?? PLACES[0];

  const choose = (nextId) => setPlaceId(nextId);

  const onKeys = (event) => {
    const index = PLACES.findIndex((item) => item.id === placeId);
    if (event.key !== "ArrowRight" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowUp") {
      return;
    }
    event.preventDefault();
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = PLACES[(index + step + PLACES.length) % PLACES.length];
    choose(next.id);
    event.currentTarget.parentElement?.querySelector(`[data-place="${next.id}"]`)?.focus();
  };

  return (
    <section id="roots" className="block">
      <Reveal>
        <p className="kicker">
          <span>03</span> Roots
        </p>
        <h2>From a town on the bay.</h2>
        <div className="prose prose-wide">
          <p>
            I'm from Tanza, in the province of Cavite, in the Philippines. Tanza is coastal.
            Manila Bay is to the west, and Manila is off to the north.
          </p>
          <p>
            People sometimes skip the town and say the province, or skip both and say the
            country. I like starting with Tanza. It's specific. It's mine.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="place-layout">
          <div className="rings" aria-hidden="true">
            {PLACES.map((item) => (
              <div
                key={item.id}
                className={`ring ring-${item.id} ${placeId === item.id ? "is-selected" : ""}`}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className="place-copy">
            <p className="kicker">
              <span>Place</span>
            </p>
            <AnimatePresence mode="wait">
              <motion.h3
                key={place.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
              >
                {place.label}
              </motion.h3>
            </AnimatePresence>
            <p aria-live="polite">{place.note}</p>
            {place.id === "tanza" ? (
              <p className="coords">14°24′ N, 120°51′ E · municipal center</p>
            ) : null}
            <div className="place-picks" role="radiogroup" aria-label="Where I'm from">
              {PLACES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  data-place={item.id}
                  aria-checked={placeId === item.id}
                  className={placeId === item.id ? "is-selected" : ""}
                  onClick={() => choose(item.id)}
                  onMouseEnter={() => choose(item.id)}
                  onFocus={() => choose(item.id)}
                  onKeyDown={onKeys}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Later() {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState("");

  return (
    <section id="later" className="block">
      <Reveal>
        <p className="kicker">
          <span>04</span> Later · future work
        </p>
        <h2>Nothing here yet.</h2>
        <div className="prose prose-wide">
          <p>
            This is a shelf for future work. I'm leaving it empty on purpose. When I make
            something I can stand behind — for school, or on my own — I'll put it in one of
            these frames and say what it actually is.
          </p>
          <p>Until then, an open frame is more honest than a made-up project.</p>
        </div>
      </Reveal>
      <div className="frames">
        {FRAMES.map((frame, index) => {
          const open = openId === frame.id;
          return (
            <Reveal key={frame.id} delay={0.06 * index}>
              <button
                type="button"
                className={`frame ${open ? "is-open" : ""}`}
                aria-expanded={open}
                onClick={() => setOpenId(open ? "" : frame.id)}
              >
                <span className="frame-num">{frame.num}</span>
                <span className="frame-label">
                  Reserved
                  <strong>{frame.label}</strong>
                </span>
                <span className="frame-state">{open ? "Close note" : "Future work"}</span>
              </button>
              {open ? (
                <motion.p
                  className="frame-note"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                >
                  {frame.detail}
                </motion.p>
              ) : null}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Close() {
  return (
    <footer id="close" className="close" data-surface="dark">
      <div className="close-shore" aria-hidden="true">
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none">
          <path
            fill="#f3eee4"
            d="M0 0h1440v46c-220 62-420-20-700 8C460 74 240 18 0 58Z"
          />
        </svg>
      </div>
      <div className="close-inner">
        <Reveal>
          <p className="kicker on-dark">
            <span>05</span> Close
          </p>
          <h2>That's what I can tell you.</h2>
          <div className="prose prose-wide on-dark">
            <p>
              Thanks for reading this far. I'm Prince Kyle Ortiz. I'm 18. I'm from Tanza,
              Cavite, Philippines, and I study at Granby College of Science and Technology.
            </p>
            <p>
              If we cross paths again, I hope the shelf above has something real on it. It
              will, when I do.
            </p>
          </div>
          <p className="signature">
            Prince Kyle <em>Ortiz</em>
          </p>
          <a className="totop" href="#top">
            Back to the top
            <svg className="arrow" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 12.5V3.5M8 3.5 4 7.5M8 3.5l4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
          <p className="colophon">Prince Kyle Ortiz · Tanza, Cavite · 2026</p>
        </Reveal>
      </div>
    </footer>
  );
}

export default function App() {
  const dark = useDarkSurface();
  const active = useActiveSection();

  return (
    <>
      <a className="skip" href="#about">
        Skip to about
      </a>
      <Progress />
      <Chrome dark={dark} active={active} />
      <main>
        <Hero />
        <div className="sheet" data-surface="light">
          <MarginRule />
          <About />
          <Education />
          <Roots />
          <Later />
        </div>
        <Close />
      </main>
    </>
  );
}
