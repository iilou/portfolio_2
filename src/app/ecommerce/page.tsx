"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#c1c1c1]">
      <div className="h-[250px]"></div>
      <div className="text-[52px] font-bold leading-[40px]">Ecommerce Page</div>
      <div className="text-[22px] text-center font-black text-[#787878]">
        Coming soon...
      </div>
      <div className="text-[15px] text-center font-light text-[#787878]">
        Hold page for future ecommerce site (e.g. shop, marketplace)
      </div>
      <div className="h-[150px]"></div>
      <div
        onClick={() => {
          router.push("/");
          window.location.reload();
        }}
        className="px-[20px] py-[5px] hover:shadow-[0_0_0_2px_#000] rounded-[5px] shadow-[0_0_0_1px_#232323] cursor-pointer"
      >
        Back to home
      </div>
    </div>
  );
}
