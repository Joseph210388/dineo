'use client'

import React, { useState, useEffect } from 'react';
import Logo from '../../public/icons/logo.png';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../auth-provider';
import { signOutAction } from '../../backend/actions/user';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  async function handleLogout() {
    await signOutAction();
    window.location.href = '/';
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-stone-800 border-b-2 border-b-red-700">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-stone-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              <svg
                className={`block h-6 w-6 ${isMobileMenuOpen ? 'hidden' : 'block'}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              <svg
                className={`h-6 w-6 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Image
                className="h-8 w-auto"
                src={Logo}
                alt="Taipei"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <a href="/" className="text-stone-300 hover:bg-stone-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                  Inicio
                </a>
                <a href="/food" className="text-stone-300 hover:bg-stone-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                  Comida
                </a>
                <a href="/about" className="text-stone-300 hover:bg-stone-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                  Nosotros
                </a>
                <a href="/contact" className="text-stone-300 hover:bg-stone-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                  Contactanos
                </a>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex  pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 ">
           
            {/* Aquí puedes poner el botón para iniciar sesión */}
            <div className='flex items-center gap-2'>
              {!user && (
                <>
                  <Link href="/sign-in">
                    <button type="button" className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-2 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-700">Login</button>
                  </Link>
                  <Link href="/sign-up">
                    <button type="button" className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-2 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-700">Register</button>
                  </Link>
                </>
              )}
              {user && (
                  <div className='flex items-center ml-auto gap-2'>
                    <a
                      type="button" href="/cart" className="relative rounded-full bg-stone-800 p-1 text-stone-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <span className="absolute -inset-1.5"></span>
                      <span className="sr-only">View cart</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.964 11.853a2 2 0 002.024 1.476h8.011a2 2 0 002.023-1.476L23 5H7m7 6v4m-4-4v4m8-4v6h5V7h-7m2 10h7v2H8v-2h6z" />
                      </svg>
                    </a>
                    <a href='/reservation' type='button' className='relative rounded-full bg-stone-800 p-1 text-stone-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'>
                      <span className="absolute -inset-1.5"></span>
                      <span className="sr-only">View reservation</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                      </svg>
                    </a>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg bg-red-700 px-2 py-2 text-sm font-medium text-white hover:bg-red-800"
                  >
                    Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
        <div className="space-y-1 px-2 pb-3 pt-2">
          <a href="/" className="text-gray-300 hover:bg-stone-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
            Inicio
          </a>
          <a href="/food" className="text-gray-300 hover:bg-stone-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
            Comida
          </a>
          <a href="/about" className="text-gray-300 hover:bg-stone-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
            Nosotros
          </a>
          <a href="/contact" className="text-gray-300 hover:bg-stone-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
            Contactanos
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
