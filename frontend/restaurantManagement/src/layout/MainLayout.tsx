
import {Outlet} from "react-router-dom";
import Sidebar from "./components/Sidebar";


export default function () {
  return (
   <div className="flex overflow-hidden">
        <div>
          <Sidebar/>
        </div>
        <div className="w-full overflow-auto">
          <main className="h-screen bg-[#ffffff]">
            <Outlet/>
          </main> 
        </div>
    </div>
  )
}
