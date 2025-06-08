const projects : { 
    title: string;
    description: string;
    image: string;
    link: string;
    tags: string[];
    github: string;
    route: string;
}[] = [
    {
        title: "Springs and Things",
        description: "The website is meant to be a bike repair service website that displays a vast variety of bike repair services and an appointment booking system.",
        image: "/service.png",
        link: "https://seg3125-servicesite.vercel.app/",
        tags: [ "Javascript", "React js", "Next js", "Tailwind CSS"],
        github: "https://github.com/iilou/seg3125_servicesite",
        route: "/service",
    },
    {
        title: "Game Placeholder",
        description: "A small game",
        image: "",
        link: "",
        tags: ["Example 1", "Example 2", "Example 3"],
        github: "",
        route: "/game",
    },
    {
        title: "E-commerce Site Placeholder",
        description: "An e-commerce site",
        image: "",
        link: "",
        tags: ["Example 1", "Example 2", "Example 3"],
        github: "",
        route: "/ecommerce",
    },
    {
        title: "Analytics Site Placeholder",
        description: "An analytics site (BI, sport, anything with visualization)",
        image: "",
        link: "",
        tags: ["Example 1", "Example 2", "Example 3"],
        github: "",
        route: "/analytics",
    },
    // {
    //     title: "star.stylla.moe",
    //     description: "Fullstack web application for Honkai: Star Rail. ",
    //     image: "",
    //     link: "https://star.stylla.moe",
    //     tags: ["Next.js", "Tailwind CSS", "TypeScript", "FastAPI", "PostgreSQL", "Docker", "Python"],
    //     github: "https://github.com/iilou/starrailproject_fe",
    // },
]

// const experience 

export { projects };