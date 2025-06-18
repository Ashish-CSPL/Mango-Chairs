import Image from "next/image";
import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white text-black text-sm">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Logo and Description */}
        <div>
          <Image
            src="/fazfood.svg"
            alt="Company Logo"
            width={150}
            height={40}
          />
          <p className="mt-4 text-gray-600">
            Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
            In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
          </p>
          <div className="flex space-x-4 mt-4">
            <i className="fab fa-facebook text-xl cursor-pointer" />
            <i className="fab fa-x-twitter text-xl cursor-pointer" />
            <i className="fab fa-instagram text-xl cursor-pointer" />
            <i className="fab fa-pinterest text-xl cursor-pointer" />
            <i className="fab fa-youtube text-xl cursor-pointer" />
          </div>
        </div>

        {/* Working Hours */}
        <div>
          <h4 className="text-lg font-semibold mb-4">WORKING HOURS</h4>
          <div className="space-y-1 text-gray-700">
            <div className="flex justify-between">
              <span>Monday - Friday</span>
              <span>09:00 - 22:00</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday</span>
              <span>11:00 - 00:00</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday</span>
              <span>11:00 - 23:00</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>* Happy hour</span>
              <span>17:00 - 21:00</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="text-lg font-semibold mb-4">OUR ADDRESS</h4>
          <div className="space-y-3 text-gray-700">
            <p className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 mt-1" />
              Silk St, Barbican, London EC2Y 8DS, UK
            </p>
            <p className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              +39-055-123456
            </p>
            <p className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              booking@patiotime.com
            </p>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-lg font-semibold mb-4">NEWSLETTER</h4>
          <p className="text-gray-700 mb-3">Receive the latest news from us.</p>
          <div className="relative mb-3">
            <input
              type="email"
              placeholder="Your Email Address"
              className="w-full border-b border-gray-400 py-1 pr-10 bg-transparent placeholder-gray-500 outline-none"
            />
            <button className="absolute right-0 top-0 mt-1 text-xl">
              &#8594;
            </button>
          </div>
          <div className="flex items-center mt-2">
            <input type="checkbox" id="privacy" className="mr-2" />
            <label htmlFor="privacy" className="text-gray-700 text-sm">
              I agree to the Privacy Policy
            </label>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 pt-4 pb-6 text-center text-xs text-gray-500">
        <p>© Copyright PatioTime WordPress Theme for Restaurant & Cafe.</p>
        {/* <div className="flex justify-center gap-6 mt-2">
          <span className="hover:underline cursor-pointer">PRIVACY</span>
          <span className="hover:underline cursor-pointer">TERM OF USE</span>
          <span className="hover:underline cursor-pointer">POLICY</span>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
