import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Layout from '../../components/Layout';
import {
  getAdminOrderAllAPI,
} from "../../api/admin-api";
import { order_type } from "../../context/context-type";
import { useAuthUser } from "react-auth-kit";
import ForbiddenPage from "../ForbiddenPage";

const MealOrderHistory = () => {
  const auth = useAuthUser();
  const token = auth()?.token;
  const [order, setOrder] = useState([order_type]);
  const [msg, setMsg] = useState("");
  const isAdmin = auth()?.role?.[0] === "ROLE_ADMIN";



  useEffect(() => {
    getAdminOrderAllAPI(token)
      .then((resp) => setOrder(resp.data.sort((a, b) => a.id - b.id)))
      .catch((err) => console.log(err));
    console.log(order)

    return () => { };
  }, [token]);

  // if user not admin forbid access
  if (!isAdmin) {
    return <ForbiddenPage />;
  }

  return (
    <Layout>
      <div className="flex flex-col min-h-screen mr-5">
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 p-4">
            <h1 className="text-3xl font-bold mb-10 mt-10 text-center">Meal Order History</h1>
            <h2 className="text-2xl font-bold mb-4 mt-10 text-center">Orders</h2>
            <table className="w-full table-auto text-white text-center driver mt-3 mr-10 mx-auto">
              <thead className="bg-cyan-950">
                <tr>
                  <th className="px-4 py-2 border-b font-semibold">No</th>
                  <th className="px-4 py-2 border-b font-semibold">Name</th>
                  <th className="px-4 py-2 border-b font-semibold">Meal Package</th>
                  <th className="px-4 py-2 border-b font-semibold">Delivery Address</th>
                  <th className="px-4 py-2 border-b font-semibold">Order Date</th>
                  <th className="px-4 py-2 border-b font-semibold">Prepared By</th>
                  <th className="px-4 py-2 border-b font-semibold">Delivered By</th>
                  <th className="px-4 py-2 border-b font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {order.map((x, i) => (
                  <tr key={x.id}>
                    <td className="text-black border-b font-medium">{i + 1}</td>
                    <td className="text-black border-b font-medium">{x.orderBy.name}</td>
                    <td className="text-black border-b font-medium">{x.mealPackage.packageName}</td>
                    <td className="text-black border-b font-medium">{x.orderBy.address}</td>
                    <td className="text-black border-b font-medium">
                      {new Date(x.orderOn).toLocaleString("en-GB", {
                        timeZone: "Asia/Singapore",
                        hour12: true,
                      })}
                    </td>
                    <td className="text-black border-b font-medium">{x.preparedBy?.name}</td>
                    <td className="text-black border-b font-medium">{x.deliveredBy?.name}</td>
                    <td className="text-black border-b font-medium">{x.orderStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MealOrderHistory;
