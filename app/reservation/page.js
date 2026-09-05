'use client';
import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/auth-provider";
import { getReservationsByUser } from "../../backend/actions/reservation";

export default function Reservation(){

    const { user } = useAuth();
    const userId = user?.id;
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReservations() {
            try {
                const userReservations = await getReservationsByUser();
                setReservations(userReservations);
            } catch (error) {
                console.error("Error al obtener las reservas del usuario:", error);
            }
        }
        if (userId) {
            fetchReservations();
        }
    }, [userId]);

    return(
        <>
            <div className="bg-cream min-h-[calc(100svh-8rem)] p-3 md:p-10">
                <span className="flex items-center">
                    <span className="h-px flex-1 bg-red-700"></span>
                        <h1 className="text-3xl mb-2 font-semibold px-6">
                            Reservas de {user?.firstName} {user?.lastName}
                        </h1>
                    <span className="h-px flex-1 bg-red-700"></span>
                </span>
                    <div className="flex flex-col w-full pt-6 p-2">
                        <div className="">
                            <div className="bg-red-500 rounded-xl p-5 text-white flex flex-col gap-3">
                                <p>Estimado cliente, {user?.firstName} {user?.lastName}</p>
                                <p>Recuerda que una vez confirmada, tu reserva no puede ser cancelada, editada o cambiada de fecha. Si necesitas ayuda, contáctanos al 234-76-78-00</p>
                                <p>Gracias por tu comprensión.</p>
                            </div>
                        </div>
                        <div className=" lg:px-16 py-8 lg:py-3">
                            {reservations.length === 0 ? (
                                <p>No tienes reservas.</p>
                            ) : (
                                <ul>
                                    {reservations.map((reservation, index) => (
                                        <li key={index} className="pt-4">
                                            <div className="flex gap-2 flex-col bg-white border border-red-500 rounded-xl p-4 px-7">
                                                <div className="flex gap-2">
                                                    <p className="font-bold">Id: </p><span className="text-gray-500 font-bold">{reservation._id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <div>
                                                            <p className="font-bold">Nombre del Cliente: </p><span className="">{user?.firstName} {user?.lastName}</span>
                                                            <p className="font-bold">Platillos:</p>
                                                        <ul>
                                                            {reservation.dishDetail.map((dish, dishIndex) => (
                                                                <li key={dishIndex} className="flex gap-2 items-center">
                                                                    <p className="text-sm">{dish.quantity}X </p><p>{dish.dishName} </p>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="text-right">
                                                        <div>
                                                            <p className="font-bold">Fecha y Hora: </p><p>{reservation. reservationDate.slice(0, 10)} </p><span>{reservation.reservationTime}</span>
                                                        </div>
                                                        <p className="font-bold">Personas:</p> <span>{reservation.numberOfPeople}</span>
                                                        {/* Mostrar otros detalles de la reserva según sea necesario */}
                                                    </div>
                                                </div>
                                                <hr></hr>
                                                <div className="flex justify-end">
                                                    <p className="font-bold">Precio: </p><span>{reservation.total_price}€</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                    </div>

            </div>
        </>
    );
}