'use client';

import React from "react";
import { getDishById } from "../../../backend/actions/dish";
import AddToCartButton from "../../../components/addToCartButton/addtocartbutton";

const DishDetailPage = async ({ params }) => {
    const { id } = await params;
    const dish = await getDishById(id);
    
    
    return (
        <div className="my-24">
            <div className="m-8 w-fit">
                <a href="/food" className="underline flex gap-1 items-center text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-left-fill" viewBox="0 0 16 16">
                    <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
                </svg>    
                    Back to all dishes
                </a>
            </div>
            <section className="text-gray-700 body-font overflow-hidden">
                <div className="px-5 py-4 mx-auto sm:px-2">
                    <div className="lg:w-4/5 mx-auto flex flex-wrap">
                        <img
                            src={dish.image}
                            className="lg:w-1/2 w-full object-cover object-center rounded-xl xl:rounded-l-xl xl:rounded-r-none border border-gray-200"
                        />
                        <div className="lg:w-1/2 w-full p-4 lg:pl-14 lg:py-6 mt-6 lg:mt-0 flex flex-col gap-4 rounded-xl xl:rounded-r-xl xl:rounded-l-none bg-white">
                            <h2 className="whitespace-nowrap rounded-xl bg-red-800 text-white px-3 py-1.5 text-xs font-medium w-fit">{dish.category}</h2>
                            <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">{dish.name}</h1>
                            <p className="leading-relaxed">{dish.description}</p>
                            <h3 className="font-medium">Ingredientes:</h3>
                            <ul className="ml-4" style={{ listStyleType: 'disc' }}>
                                {dish.ingredients.map((ingredient, index) => (
                                    <li key={index}>{ingredient}</li>
                                ))}
                            </ul>
                            <hr></hr>
                            <div className=" m-2 flex items-center justify-between">
                                <p className="title-font font-medium text-3xl text-gray-900">{dish.price}€</p>
                                <AddToCartButton dishId={dish._id} imageUrl={dish.image} />
                            </div>
                        </div>
                        
                    </div>
                </div>
            </section>   
        </div>
    );
}

export default DishDetailPage;