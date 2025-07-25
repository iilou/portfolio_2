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
        title: "Memora",
        description: "A small memory game where the player has to remember a unordered sequence of tiles.",
        image: "/game.png",
        link: "https://memora-nine.vercel.app/",
        tags: [ "Javascript", "React js", "Next js", "Tailwind CSS"],
        github: "https://github.com/iilou/memora",
        route: "/game",
    },
    {
        title: "Wings & Teas",
        description: "Pick from our assortment of garden creature themed accessories and perfectly brewed teas.",
        image: "/ecom.png",
        link: "https://ecom-peach-theta.vercel.app/",
        tags: ["JavaScript", "React", "Next.js", "Tailwind CSS"],
        github: "https://github.com/iilou/ecom",
        route: "/ecommerce",
    },
    {
        title: "Bazaar",
        description: "Stock data visualization for historical stock information.",
        image: "/dashboard.png",
        link: "https://dashboard-nine-snowy-44.vercel.app/",
        tags: ["JavaScript", "React", "Next.js", "Tailwind CSS", "Chart.js"],
        github: "https://github.com/iilou/dashboard",
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