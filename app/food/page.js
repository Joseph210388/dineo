'use client'
import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/auth-provider";
import { format } from 'date-fns';
import Slider from "../../components/slider/slider";
import { getAllDish } from "../../backend/actions/dish";
import DishCard from "../../components/dishcard/dishcard";


export default function Food(){

    const { user } = useAuth();
    const [fechaActual, setFechaActual] = useState(new Date());
    const [dishes, setDishes] = useState([]);

    

    useEffect(() => {
        const intervalo = setInterval(() => {
            // Actualizar la fecha cada segundo
            setFechaActual(new Date());
        }, 1000);
        
        const getDish = async ()=>{
            const dishesList = await getAllDish();
            dishesList && setDishes(dishesList);
        };

        getDish();

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(intervalo);
    }, []);

    
    return(
        <>
            <div className="bg-stone-200 flex-1 p-5 ">
                <div>
                    {/* Slider */}
                    <Slider/>
                    {/* TITULO */}
                    <span className="flex items-center">
                        <span className="h-px flex-1 bg-red-700"></span>
                        <h1 className="text-3xl mb-2 font-semibold px-6">
                            Selecciona tus platillos <span className="text-red-700">{user?.firstName} {user?.lastName}</span>
                        </h1>
                        <span className="h-px flex-1 bg-red-700"></span>
                    </span>
                    {/* Fecha actual */}
                    <div className="flex flex-col text-left px-6 sm:text-center">
                        <span>Hoy</span>
                        <span>{format(fechaActual, 'dd/MM/yyyy')}</span>
                    </div>
                </div>
                {/* Platilos disponibles */}
                <div>
                    <h2 className="py-3 text-2xl font-semibold underline decoration-red-700">Platillos disponibles:</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {dishes.map(dish => (
                        <DishCard key={dish._id} dish={dish}/>
                    ))}
                </div>
                </div>
            </div>
        </>
    );   
}
