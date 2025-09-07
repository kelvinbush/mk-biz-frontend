import { useAppSelector } from "@/lib/redux/hooks";
import { UserNav } from "@/components/dashboard/user-nav";
import { selectTopBar } from "@/lib/redux/features/top-bar.slice";

const Topnav = () => {
  const title = useAppSelector(selectTopBar);
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-white py-3 px-4 md:pl-[308px] shadow-md">
      <div className="flex-1 flex items-center justify-center md:justify-start">
        <p className="text-lg md:text-xl font-medium leading-tight text-midnight-blue pl-6 md:pl-0 text-center md:text-left">
          {title}
        </p>
      </div>
      <div className="flex items-center gap-4 md:gap-8">
        <UserNav />
      </div>
    </div>
  );
};

export default Topnav;
