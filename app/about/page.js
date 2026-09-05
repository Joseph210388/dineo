/* conmponetes */
import React from "react";

export default function About(){
    return(
        <>
        {/* About */}
        <div id="about" className="relative bg-cream overflow-hidden ">
            <div className="max-w-7xl mx-auto">
                <div className="relative z-10 pb-8 bg-cream sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                    <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-cream transform translate-x-1/2"
                        fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <polygon points="50,0 100,0 50,100 0,100"></polygon>
                    </svg>

                    <div className="pt-1"></div>

                    <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:pl-8 lg:pr-12 xl:mt-28">
                        <div className="sm:text-center lg:text-left">    
                            <h2 className="my-6 text-2xl tracking-tight font-extrabold text-stone-900 sm:text-3xl md:text-4xl">Sobre Nosotros</h2>
                            
                            <p className="text-stone-900">
                                Taipei es un restaurante en Asturias que ofrece auténtica gastronomía peruana desde 1990. Nos apasiona compartir los sabores y tradiciones culinarias de Perú con el mundo. Nuestro talentoso equipo de chefs, fusiona técnicas contemporáneas con sabores auténticos.
                            </p>
                        </div>
                    </main>
                </div>
            </div>
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                <img className="h-56 w-full object-cover object-top sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://images.pexels.com/photos/6937464/pexels-photo-6937464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt=""/>
            </div>
        </div>
        {/* Stats */}
        <section className="bg-stone-800">
            <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">Confiado por Amantes de la Gastronomía Peruana</h2>

                <p className="mt-4 text-white sm:text-xl">
                Descubre la auténtica experiencia culinaria del Perú con nosotros. Desde los sabores tradicionales hasta las creaciones más innovadoras, estamos comprometidos a llevar lo mejor de la cocina peruana a tu mesa.
                </p>
                </div>

                <div className="mt-8 sm:mt-12">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:divide-x sm:divide-gray-100">
                    <div className="flex flex-col px-4 py-8 text-center">
                    <dt className="order-last text-lg font-medium text-white">Empleados</dt>

                    <dd className="text-4xl font-extrabold text-red-600 md:text-5xl">50</dd>
                    </div>

                    <div className="flex flex-col px-4 py-8 text-center">
                    <dt className="order-last text-lg font-medium text-white">Locales</dt>

                    <dd className="text-4xl font-extrabold text-red-600 md:text-5xl">5</dd>
                    </div>

                    <div className="flex flex-col px-4 py-8 text-center">
                    <dt className="order-last text-lg font-medium text-white">Clientes</dt>

                    <dd className="text-4xl font-extrabold text-red-600 md:text-5xl">1000 +</dd>
                    </div>
                </dl>
                </div>
            </div>
        </section>
        {/* Galeria */}
        <div className="bg-cream py-6">
            <div className="flex flex-col items-center mb-2 mt-6 ">
                <h3 className="md:text-4xl text-2xl text-center font-bold text-stone-900">Galería</h3>
                <hr className="border-1 w-2/6 border-red-600"/>
            </div>
            <section className="">
                <div className="py-4 px-2 mx-auto max-w-screen-xl sm:py-4 lg:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 h-full">
                        <div className="col-span-2 sm:col-span-1 md:col-span-2  h-auto md:h-full flex flex-col">
                            <a href="/food" className="group relative flex flex-col overflow-hidden rounded-lg px-4 pb-4 pt-40 flex-grow">
                                <img src="https://cdn.pixabay.com/photo/2022/06/05/00/38/dinner-7243061_1280.jpg" alt="" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" />
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/25 to-gray-900/5"></div>
                                <h3 className="z-10 text-2xl font-medium text-white absolute top-0 left-0 p-4 xs:text-xl md:text-3xl">Principal</h3>
                            </a>
                        </div>
                        <div className="col-span-2 sm:col-span-1 md:col-span-2 ">
                            <a href="/food" className="group relative flex flex-col overflow-hidden rounded-lg px-4 pb-4 pt-40 mb-4">
                                <img src="https://cdn.pixabay.com/photo/2016/08/11/20/59/rocoto-1586775_1280.jpg" alt="" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" />
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/25 to-gray-900/5"></div>
                                <h3 className="z-10 text-2xl font-medium text-white absolute top-0 left-0 p-4 xs:text-xl md:text-3xl">Entradas</h3>
                            </a>
                            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
                                <a href="/food" className="group relative flex flex-col overflow-hidden rounded-lg px-4 pb-4 pt-40">
                                    <img src="https://images.unsplash.com/photo-1457666134378-6b77915bd5f2?q=80&w=1634&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/25 to-gray-900/5"></div>
                                    <h3 className="z-10 text-2xl font-medium text-white absolute top-0 left-0 p-4 xs:text-xl md:text-3xl">Postres</h3>
                                </a>
                                <a href="/food" className="group relative flex flex-col overflow-hidden rounded-lg px-4 pb-4 pt-40">
                                    <img src="https://plus.unsplash.com/premium_photo-1661342430103-778ac87489bc?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/25 to-gray-900/5"></div>
                                    <h3 className="z-10 text-2xl font-medium text-white absolute top-0 left-0 p-4 xs:text-xl md:text-3xl">Vinos</h3>
                                </a>
                            </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1 md:col-span-1 h-auto md:h-full flex flex-col">
                            <a href="/food" className="group relative flex flex-col overflow-hidden rounded-lg px-4 pb-4 pt-40 flex-grow">
                                <img src="https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" />
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/25 to-gray-900/5"></div>
                                <h3 className="z-10 text-2xl font-medium text-white absolute top-0 left-0 p-4 xs:text-xl md:text-3xl">Bebidas</h3>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </>
    );
}