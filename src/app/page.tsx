"use client";

import Image from "next/image";
import { Download } from "@mui/icons-material";
import { useRef, useEffect } from "react";
import { line, now, quadtree } from "d3";
import { request } from "http";
import { useState } from "react";
import { projects } from "./data";
import { OpenInNew } from "@mui/icons-material";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  let particles: {
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
    order: number;
  }[] = [];
  const numParticles = 1000;

  const hue = 0;
  const hueVelocity = 0.01;
  const saturation = 0.3;
  const lightness = 0.7;
  const maxRadius = 2;
  const minRadius = 0.5;
  const maxSpeed = 0.5;
  const minSpeed = -0.5;
  const maxAlpha = 0.1;
  const minAlpha = 0;
  const minAlphaParticle = 0.1;
  const maxAlphaParticle = 0.5;
  const maxDistance = 100;
  const lineWidth = 0.5;
  // const cursorPosition = { x: 0, y: 0 };
  // const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const cursorPosition = { x: 0, y: 0 };
  const [cursorPositionState, setCursorPosition] = useState({
    x: 0,
    y: 0,
  });
  const cursorScroll = { x: 0, y: 0 };
  const mouseMinorRadius = 140;
  const mouseMajorRadius = 350;
  const mouseMinorRadiusParticle = 100;
  const mouseMajorRadiusParticle = 600;
  const mouseAlpha = 0.6;
  const mouseAlphaParticle = 0.6;

  const [scrollY, setScrollY] = useState(0);

  const drawParticle = (p: { x: number; y: number; radius: number }) => {
    ctxRef.current!.beginPath();
    ctxRef.current!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    // ctxRef.current!.fillStyle = color;
    ctxRef.current!.fill();
    ctxRef.current!.closePath();
  };
  const drawLine = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => {
    ctxRef.current!.beginPath();
    ctxRef.current!.moveTo(p1.x, p1.y);
    ctxRef.current!.lineTo(p2.x, p2.y);
    // ctxRef.current!.strokeStyle = color;
    // ctxRef.current!.lineWidth = lineWidth;
    ctxRef.current!.stroke();
    ctxRef.current!.closePath();
  };

  const update = (
    p: {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
    },
    deltaTime: number
  ) => {
    // check stuck particles
    p.x = Math.max(
      p.radius,
      Math.min(p.x, canvasRef.current!.width - p.radius)
    );
    p.y = Math.max(
      p.radius,
      Math.min(p.y, canvasRef.current!.height - p.radius)
    );

    p.x += p.speedX * deltaTime;
    p.y += p.speedY * deltaTime;
    if (p.x + p.radius > canvasRef.current!.width || p.x - p.radius < 0) {
      p.speedX = -p.speedX;
    }
    if (p.y + p.radius > canvasRef.current!.height || p.y - p.radius < 0) {
      p.speedY = -p.speedY;
    }
  };

  const FPS = 120;
  const interval = 1000 / FPS;
  let lastTime = 0;
  let deltaTime = 0;

  const drawFrame = (now: number) => {
    if (now - lastTime < interval) {
      requestAnimationFrame(drawFrame);
      return;
    }
    deltaTime = now - lastTime;
    lastTime = now;

    ctxRef.current!.clearRect(
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height
    );

    console.log("drawFrame", particles.length && particles[0].x);

    const hueValue = (hue + hueVelocity * now) % 360;
    const color = `hsl(${hueValue}, ${saturation * 100}%, ${lightness * 100}%)`;
    ctxRef.current!.fillStyle = color;
    ctxRef.current!.strokeStyle = color;

    const particleQueue = [] as {
      p: { x: number; y: number; radius: number };
      mouseDist: number;
    }[];
    for (let i = 0; i < particles.length; i++) {
      particleQueue.push({
        p: particles[i],
        mouseDist: Math.hypot(
          cursorPosition.x + cursorScroll.x - particles[i].x,
          cursorPosition.y + cursorScroll.y - particles[i].y
        ),
      });
    }
    particleQueue.sort((a, b) => a.mouseDist - b.mouseDist);
    for (let i = 0; i < particleQueue.length; i++) {
      //percent rounded to nearest 10%
      const alphaPercent: number =
        particleQueue[i].mouseDist > mouseMajorRadiusParticle
          ? 0
          : particleQueue[i].mouseDist < mouseMinorRadiusParticle
          ? 100
          : 100 -
            Math.round(
              (10 * (particleQueue[i].mouseDist - mouseMinorRadiusParticle)) /
                (mouseMajorRadiusParticle - mouseMinorRadiusParticle)
            ) *
              10;

      ctxRef.current!.globalAlpha =
        (maxAlphaParticle - minAlphaParticle) * (alphaPercent / 100) +
        minAlphaParticle;
      drawParticle(particleQueue[i].p);
    }

    // Draw lines
    const tree = quadtree(particles)
      .x((d) => d.x)
      .y((d) => d.y)
      .addAll(particles);

    // ctxRef.current!.strokeStyle = color;
    ctxRef.current!.lineWidth = lineWidth;
    const lineQueue = [] as {
      p1: { x: number; y: number };
      p2: { x: number; y: number };
      mouseDist: number;
    }[];
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      tree.visit((node, x0, y0, x1, y1) => {
        const dx = Math.max(x0 - p.x, 0, p.x - x1);
        const dy = Math.max(y0 - p.y, 0, p.y - y1);
        if (dx * dx + dy * dy > maxDistance * maxDistance) return true;
        if (!("length" in node)) {
          let leaf: typeof node | null = node;
          while (leaf) {
            const p2 = leaf.data;
            if (p !== p2 && p2.order > p.order) {
              const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
              if (distance < maxDistance) {
                const mouseDist = Math.min(
                  Math.hypot(
                    cursorPosition.x + cursorScroll.x - p.x,
                    cursorPosition.y + cursorScroll.y - p.y
                  ),
                  Math.hypot(
                    cursorPosition.x + cursorScroll.x - p2.x,
                    cursorPosition.y + cursorScroll.y - p2.y
                  )
                );
                if (mouseDist < mouseMajorRadius) {
                  lineQueue.push({ p1: p, p2: p2, mouseDist: mouseDist });
                }
                // lineQueue.push({ p1: p, p2: p2, mouseDist: mouseDist });
              }
            }
            leaf = leaf.next ?? null;
          }
        }
        return false; // continue traversal
      });
    }

    lineQueue.sort((a, b) => a.mouseDist - b.mouseDist);
    const prevAlpha = -1;
    for (let i = 0; i < lineQueue.length; i++) {
      //percent rounded to nearest 10%
      const alphaPercent: number =
        lineQueue[i].mouseDist > mouseMajorRadius
          ? 0
          : lineQueue[i].mouseDist < mouseMinorRadius
          ? 100
          : 100 -
            Math.round(
              (10 * (lineQueue[i].mouseDist - mouseMinorRadius)) /
                (mouseMajorRadius - mouseMinorRadius)
            ) *
              10;

      if (alphaPercent !== prevAlpha) {
        ctxRef.current!.globalAlpha =
          (maxAlpha - minAlpha) * (alphaPercent / 100) + minAlpha;
      }
      drawLine(lineQueue[i].p1, lineQueue[i].p2);

      // if (lineQueue[i].mouseDist < maxDistance) {
      //   drawLine(
      //     {
      //       x: cursorPosition.x,
      //       y: cursorPosition.y,
      //     },
      //     lineQueue[i].p2
      //   );
      //   drawLine(
      //     {
      //       x: cursorPosition.x,
      //       y: cursorPosition.y,
      //     },
      //     lineQueue[i].p1
      //   );
      // }
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      update(p, deltaTime / 10);
    }

    // setParticles((prevParticles) =>
    //   prevParticles.map((p) => {
    //     const newP = { ...p };
    //     update(newP, deltaTime / 10);
    //     return newP;
    //   })
    // );

    // Draw mouse
    const mouseColor = `hsl(${hueValue}, 70%, 80%)`;
    ctxRef.current!.globalAlpha = mouseAlphaParticle;
    ctxRef.current!.fillStyle = mouseColor;
    ctxRef.current!.strokeStyle = mouseColor;
    drawParticle({
      x: cursorPosition.x + cursorScroll.x,
      y: cursorPosition.y + cursorScroll.y,
      radius: 3,
    });

    ctxRef.current!.globalAlpha = mouseAlpha;
    for (let i = 0; i < particleQueue.length; i++) {
      if (particleQueue[i].mouseDist < maxDistance) {
        drawLine(
          {
            x: cursorPosition.x + cursorScroll.x,
            y: cursorPosition.y + cursorScroll.y,
          },
          particleQueue[i].p
        );
      }
    }

    requestAnimationFrame(drawFrame);
  };

  const [windowHeight, setWindowHeight] = useState(1000);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctxRef.current = canvas.getContext("2d");

      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * (maxRadius - minRadius) + minRadius,
          speedX: Math.random() * (maxSpeed - minSpeed) + minSpeed,
          speedY: Math.random() * (maxSpeed - minSpeed) + minSpeed,
          order: i,
        });
      }
      drawFrame(now());
    }
  }, []);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition((prev) => ({
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
      }));
      // cursorPosition.x = e.clientX;
      // cursorPosition.y = e.clientY;
      cursorPosition.x = e.clientX;
      cursorPosition.y = e.clientY;
    };

    // const handleMouseScroll = (e: WheelEvent) => {
    //   cursorScroll.x = window.scrollX;
    //   cursorScroll.y = window.scrollY;
    // };
    const handleScroll = (e: Event) => {
      cursorScroll.x = window.scrollX;
      cursorScroll.y = window.scrollY;
      setScrollY((prev) => window.scrollY);
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      setWindowHeight((prev) => window.innerHeight);
    };

    setWindowHeight((prev) => window.innerHeight);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    // window.addEventListener("wheel", handleMouseScroll);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      // window.removeEventListener("wheel", handleMouseScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const pushRoute = (route: string) => {
    router.push(route);
    window.location.reload();
  };

  return (
    <div
      className="font-[family-name:var(--font-geist-sans)] relative transition-colors duration-1000 ease-in-out"
      style={{
        // background: scrollY < 300 ? "#121212" : "#000000",
        background: scrollY < windowHeight * 0.4 ? "#121212" : "#070707",
      }}
    >
      <div className="w-full h-[100vh] flex flex-col items-center justify-center relative z-[10] bg-transparent">
        <canvas
          className="absolute ffixed top-0 left-0 w-full h-full z-[11]"
          id="canvas"
          ref={canvasRef}
        ></canvas>
        <div className="flex flex-col items-center justify-center z-[12] relative bg-[#0202021d] px-[50px] py-[80px] rounded-[15px] ">
          <div className="text-[50px] font-light text-[#d7d7d7] w-fit leading-[50px] rounded-[5px] px-[10px] py-[1px] h-fit">
            Hi, I'm <span className=" text-[#dd4d4d]">Marvin</span>.
          </div>
          <div className="text-[32px] font-extralight text-[#d7d7d7] w-fit rounded-[5px] px-[10px] py-[1px] text-center leading-[36px]">
            I'm a software engineer with a passion for building things that live
            on the internet.
          </div>
          <div className="flex justify-center mt-[30px]">
            <div className="group text-[#dd4d4d] text-[18px] font-bold shadow-[0_0_1px_0px_#dd4d4d,0_0_1px_1px_#dd4d4d_inset] rounded-[5px] px-[21px] py-[8px] flex justify-center items-center bg-[#121212] w-fit h-fit relative">
              <div className="absolute w-[100%] h-[100%] rounded-[5px] top-0 left-0 shadow-[0_0_0px_0px_#dd4d4d,0_0_1px_0px_#dd4d4d_inset] group-hover:scale-x-[1.3] group-hover:scale-y-[2.3] group-hover:rounded-[10px] group-hover:opacity-0 transition-all duration-500 "></div>
              <div className="absolute w-[100%] h-[100%] rounded-[5px] top-0 left-0 shadow-[0_0_0px_0px_#dd4d4d,0_0_1px_0px_#dd4d4d_inset] group-hover:scale-x-[1.3] group-hover:scale-y-[2.3] group-hover:rounded-[10px] group-hover:opacity-0 transition-all duration-500 delay-100"></div>
              <div className="absolute w-[100%] h-[100%] rounded-[5px] top-0 left-0 shadow-[0_0_0px_0px_#dd4d4d,0_0_1px_0px_#dd4d4d_inset] group-hover:scale-x-[1.3] group-hover:scale-y-[2.3] group-hover:rounded-[10px] group-hover:opacity-0 transition-all duration-500 delay-200"></div>
              <div className="w-[120px] text-right">Download CV</div>
              <div className="h-full aspect-square ml-[4px] flex justify-end items-center">
                <Download
                  className="text-[#dd4d4d] w-fit h-fit scale-[1.1]"
                  fontSize="small"
                />
              </div>
            </div>
            <div className="bg-[#af7171] text-[#121212] text-[18px] font-bold rounded-[5px] px-[25px] py-[8px] ml-[20px]">
              Contact Me
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-fit flex justify-start befwg-[#1a1a1a] z-[20] relative flex-col items-center">
        <div
          className="absolute w-full h-[25vh] bg-[#121212] top-[-12.5vh]"
          style={{
            background:
              "linear-gradient(to bottom, #12121200 0%, #121212 49%, #12121200 100%)",
          }}
        ></div>
        <div className="w-[80%] h-[7%] text-[#dd4d4d] text-[32px] font-normal bg-[#050505] rounded-[15px]  text-center leading-[36px] mt-[4vh] z-[30] pb-[8px] pt-[24px] relative transition-all duration-300 hover:bg-[#080808] hover:text-[#e42d2d] group hover:shadow-[0_0_0_1px_#dd4d4d] active:shadow-[0_0_0px_2px_#dd4d4d] shadow-[0_0_0px_0px_#dd4d4d55]">
          {/* <div className="w-full h-fit group-hover:translate-y-[2px] group-hover:translate-x-[30px] transition-all duration-200"> */}
          About
          {/* </div> */}
        </div>
        <div className="w-full h-fit flex flex-col justify-center items-center mt-[80px] gap-[50px] mb-[80px]">
          <div className="w-[272px] h-[272px] flex justify-center items-center relative">
            <div>
              <svg
                viewBox="0 0 448 512"
                xmlns="http://www.w3.org/2000/svg"
                width="200"
                height="200"
              >
                <path
                  fill="none"
                  stroke="#dd4d4d"
                  strokeWidth="12"
                  d="m224 256c70.7 0 128-57.3 128-128s-57.3-128-128-128-128 57.3-128 128 57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7c-74.2 0-134.4 60.2-134.4 134.4v41.6c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"
                />
              </svg>
            </div>
          </div>

          <div className="w-[400px] text-center flex justify-center items-center text-[#b7b7b7] font-light leading-[20px] h-fit">
            <div>
              Hi, I'm Marvin, and I am currently learning UI/UX design, my
              workflow is in the development stage. <br />
              <br />
              I'm enrolled in a UI/UX design course at University of Ottawa that
              delves into key concepts of design. This includes concepts such as
              user-centered design, heuristic evaluation, etc. For information
              on the course, you can refer to the{" "}
              <a
                href="https://catalogue.uottawa.ca/en/courses/seg/"
                target="_blank"
              >
                University of Ottawa website
              </a>
              .
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-fit flex justify-start befwg-[#1a1a1a] z-[20] relative flex-col items-center">
        <div className="w-[80%] h-[7%] text-[#dd4d4d] text-[32px] font-normal bg-[#050505] rounded-[15px]  text-center leading-[36px] mt-[4vh] z-[30] pb-[8px] pt-[24px] relative transition-all duration-300 hover:bg-[#080808] hover:text-[#e42d2d] group hover:shadow-[0_0_0_1px_#dd4d4d] active:shadow-[0_0_1px_2px_#dd4d4d] shadow-[0_0_0px_0px_#dd4d4d55]">
          {/* <div className="w-full h-fit group-hover:translate-y-[2px] group-hover:translate-x-[30px] transition-all duration-200"> */}
          Workflow
          {/* </div> */}
        </div>
        <div className="mt-[80px] mb-[50px]">
          <svg
            clip-rule="evenodd"
            fill-rule="evenodd"
            stroke-linejoin="round"
            stroke-miterlimit="2"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="200"
          >
            <path d="m-1024-64h1280v800h-1280z" fill="none" />
            <path
              d="m46.03 32c0-2.751 2.233-4.985 4.985-4.985 2.751 0 4.985 2.234 4.985 4.985s-2.234 4.985-4.985 4.985c-2.752 0-4.985-2.234-4.985-4.985z"
              fill="#dd4d4dff"
            />
            <path
              d="m41.92 41.92c1.946-1.945 5.105-1.945 7.051 0 1.945 1.946 1.945 5.105 0 7.051-1.946 1.945-5.105 1.945-7.051 0-1.945-1.946-1.945-5.105 0-7.051z"
              fill="#dd4d4dff"
            />
            <circle cx="32" cy="51.015" fill="#dd4d4d" r="4.985" />
            <path
              d="m22.08 41.92c1.945 1.946 1.945 5.105 0 7.051-1.946 1.945-5.105 1.945-7.051 0-1.945-1.946-1.945-5.105 0-7.051 1.946-1.945 5.105-1.945 7.051 0z"
              fill="#dd4d4dbb"
            />
            <path
              d="m17.97 32c0 2.751-2.233 4.985-4.985 4.985-2.751 0-4.985-2.234-4.985-4.985s2.234-4.985 4.985-4.985c2.752 0 4.985 2.234 4.985 4.985z"
              fill="#dd4d4d88"
            />
            <path
              d="m22.08 22.08c-1.946 1.945-5.105 1.945-7.051 0-1.945-1.946-1.945-5.105 0-7.051 1.946-1.945 5.105-1.945 7.051 0 1.945 1.946 1.945 5.105 0 7.051z"
              fill="#dd4d4d55"
            />
            <circle cx="32" cy="12.985" r="4.985" fill="#dd4d4d22" />
          </svg>
        </div>
        <div className="w-[400px] text-center flex justify-center items-center text-[#b7b7b7] font-light leading-[20px] h-fit mb-[50px]">
          <div>
            I am currently learning UI/UX design, my workflow is in the
            development stage. <br />
            <br />
            I'm enrolled in a UI/UX design course at University of Ottawa that
            delves into key concepts of design. This includes concepts such as
            user-centered design, heuristic evaluation, etc. For information on
            the course, you can refer to the{" "}
            <a
              href="https://catalogue.uottawa.ca/en/courses/seg/"
              target="_blank"
              className="text-[#dd4d4d] hover:text-[#e42d2d] font-black transition-all duration-200"
            >
              University of Ottawa
            </a>{" "}
            website.
          </div>
        </div>
      </div>
      <div className="w-full h-fit flex justify-start befwg-[#1a1a1a] z-[20] relative flex-col items-center">
        <div className="w-[80%] h-[7%] text-[#dd4d4d] text-[32px] font-normal bg-[#050505] rounded-[15px]  text-center leading-[36px] mt-[4vh] z-[30] pb-[8px] pt-[24px] relative transition-all duration-300 hover:bg-[#080808] hover:text-[#e42d2d] group hover:shadow-[0_0_0_1px_#dd4d4d] active:shadow-[0_0_1px_2px_#dd4d4d] shadow-[0_0_0px_0px_#dd4d4d55]">
          {/* <div className="w-full h-fit group-hover:translate-y-[2px] group-hover:translate-x-[30px] transition-all duration-200"> */}
          Projects
          {/* </div> */}
        </div>
        <div className="w-full flex flex-col items-center justify-center gap-[20px] mt-[20px] mb-[40px]">
          {projects.map((project, index) => (
            <div
              className="w-full flex-col flex justify-center items-center z-[30] relative "
              key={index}
            >
              <div
                className="w-fit flex flex-col justify-center items-start flex-wrap bg-[#0d0d0d72] rounded-[15px] px-[70px] py-[10px] h-fit group
                hover:bg-[#070707c2] transition-all duration-1000
              "
              >
                <div className="text-[#e73d3d] text-[20px] font-normal text-left w-fit group-hover:font-bold transition-all duration-500">
                  {project.title}
                </div>
                <div className="flex justify-center w-fit gap-[20px]">
                  <div className="h-[200px] aspect-[calc(16/9)] bg-[#d7d7d7] rounded-[15px] flex justify-center items-center relative">
                    <Image
                      src={
                        project.image === ""
                          ? "/image_not_available.png"
                          : project.image
                      }
                      alt={project.title}
                      fill
                      className="object-cover rounded-[15px] shadow-[0_0_0_0_#c1c1c155] group-hover:shadow-[0_0_30px_2px_#c1c1c155] transition-all duration-500
                      "
                    />
                  </div>
                  <div className="w-[600px] flex flex-col items-start justify-center gap-[7px]">
                    <div
                      className="text-[#d7d7d7] text-[16px] font-light text-left w-full h-[120px] bg-[#a2a2a212] px-[24px] py-[5px] rounded-md transition-all duration-200 cursor-default
                      
                    "
                    >
                      {project.description}
                    </div>
                    <div className="w-full flex gap-[10px]">
                      <div className="w-fit h-[40px] flex items-center bg-[#050505] rounded-[5px] pl-[14px] pr-[5px] group hover:bg-[#101010] cursor-pointer transition-all duration-200 hover:shadow-[0_0_0_1px_#ffffff] active:shadow-[0_0_1px_2px_#ffffff]">
                        <div className="h-full aspect-square flex justify-center items-center brightness-[0.5] group-hover:brightness-[0.7] transition-all duration-200">
                          <Image
                            src="/github.png"
                            alt="Github"
                            width={32}
                            height={32}
                            className="rounded-[15px] w-[24px] h-[24px] object-cover invert-[1]"
                          />
                        </div>
                        <div className="text-[#b2b2b2] text-[14px] font-black pl-[5px] pr-[1px]">
                          Github
                        </div>
                        <div className="h-full aspect-square flex justify-center items-center cursor-pointer transition-all duration-200 group-hover:text-[#ffffff] text-[#b2b2b2] ">
                          <OpenInNew
                            className="w-fit h-fit scale-[0.8]"
                            fontSize="small"
                          />
                        </div>
                      </div>
                      <div
                        className="w-fit h-[40px] flex items-center bg-[#070707] rounded-[5px] pl-[10px] pr-[5px] group hover:bg-[#101010] cursor-pointer transition-all duration-200 hover:shadow-[0_0_0_1px_#ffffff] active:shadow-[0_0_1px_2px_#ffffff]"
                        onClick={() => {
                          pushRoute(project.link);
                        }}
                      >
                        <div className="text-[#b2b2b2] text-[14px] font-black pl-[16px] pr-[1px]">
                          Link
                        </div>
                        <div className="h-full aspect-square flex justify-center items-center cursor-pointer transition-all duration-200 group-hover:text-[#ffffff] text-[#b2b2b2] ">
                          <OpenInNew
                            className="w-fit h-fit scale-[0.8]"
                            fontSize="small"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex gap-[10px] flex-wrap">
                      {project.tags.map((tag, index) => (
                        <div
                          className="w-fit h-[24px] flex items-center bg-[#343434] rounded-[12px] cursor-default hover:shadow-[0_0_0_1px_#d7d7d7] active:shadow-[0_0_1px_2px_#d7d7d7] transition-all duration-200"
                          key={index}
                        >
                          <div className="text-[#b2b2b2] text-[12px] font-bold px-[20px] ">
                            {tag}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div></div>
            </div>
          ))}
        </div>
      </div>
      {/* <div
        className="w-[10px] h-[10px] absolute top-0 left-0 bg-[#dd4d4da1] rounded-full z-[1000] pointer-events-none"
        id="cursor"
        style={{
          transform: `translate(${cursorPositionState.x - 5}px, ${
            cursorPositionState.y - 5
          }px)`,
          transition: "transform 0.02s ease-in-out",
          backgroundColor: `hsl(${hue}, 50%, 60%)`,
          opacity: 0.5,
        }}
      ></div> */}
    </div>
  );
}
