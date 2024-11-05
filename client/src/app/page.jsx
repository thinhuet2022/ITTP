import Image from "next/image";
import Link from "next/link";
import Footer from "./Footer";
import UploadImage from "./UploadImage";
import Header from "./Header";
export default function Home() {
  return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 py-6">
          <UploadImage/>
        </main>
        <Footer/>
      </div>
  );
}
