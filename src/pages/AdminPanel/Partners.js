import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Sidebar from "./Sidebar";
import Layout from "../../components/Layout";
import { FaSearch } from "react-icons/fa";
import { useAuthUser } from "react-auth-kit";
import ForbiddenPage from "../ForbiddenPage";
import { getProfile } from '../../api/profile-api';
import { getAdminPartnerAPI, getAdminPartnerActiveAPI } from '../../api/admin-api';
import { user_type } from "../../context/context-type";

const Partners = () => {
  const auth = useAuthUser();
  const token = auth()?.token;
  const [profile, setProfile] = useState({});
  const role = auth()?.role[0];
  const navigate = useNavigate();
  const isAdmin = auth()?.role?.[0] === "ROLE_ADMIN";
  const [partner, setPartner] = useState([user_type])
  const [inactivePartner, setInactivePartner] = useState([user_type])
  const [msg, setMsg] = useState("")

  function handleAccept(id) {
    getAdminPartnerActiveAPI(token, id)
      .then((resp) => setMsg(resp.data.message))
      .catch((err) => console.log(err))
  }

  const fetchData = async () => {
    if (!auth()) {
      // User is not authenticated and cookies are expired
      navigate("/login");
    }
    const userEmail = auth()?.email;
    const res = await getProfile(userEmail, role);
    setProfile(res);
    // Rest of your code here
  };

  useEffect(() => {
    fetchData()

    getAdminPartnerAPI(token)
      .then((resp) => {
        resp.data = resp.data
          .filter((item) => {
            return item.active === true
          })
          .map((item) => {
            setPartner(item)
            return item
          })
        setPartner(resp.data)
      })
      .catch((err) => console.log(err))

    getAdminPartnerAPI(token)
      .then((resp) => {
        resp.data = resp.data
          .filter((item) => {
            return item.active === false
          })
          .map((item) => {
            setInactivePartner(item)
            return item
          })
        setInactivePartner(resp.data)
      })
      .catch((err) => console.log(err))
  }, [token, msg])

  if (!isAdmin) {
    return <ForbiddenPage />;
  }

  return (
    <Layout>
      <div className="flex min-h-screen mr-5">
        <Sidebar />
        <div className="flex-1 p-4">
          <h1 className="text-3xl font-bold mb-10 mt-10 text-center">Partners Management</h1>
          <h2 className="text-2xl font-bold mb-5 ml-10 mt-10 text-center">Partnership Request</h2>
          {/* Partnership Request Table */}
          <div className="card mb-5">
            <div className="container">
              <table className="w-full table-auto text-white text-center driver mt-3 ml-10">
                <thead className="bg-cyan-950">
                  <tr>
                    <th className="px-4 py-2 border-b font-semibold">Company Name</th>
                    <th className="px-4 py-2 border-b font-semibold">Image</th>
                    <th className="px-4 py-2 border-b font-semibold">Address</th>
                    <th className="px-4 py-2 border-b font-semibold">Email</th>
                    <th className="px-4 py-2 border-b font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {inactivePartner.length > 0 ? (
                    inactivePartner.map((data) => (
                      <tr key={data.id} className="border-b">
                        <td className="text-black border-b font-medium">{data.name}</td>
                        <td className="text-black border-b font-medium">
                          <img
                            className="h-16 w-16 object-contain"
                            src={`data:image/jpeg;base64,${data?.profilePicture}`}
                            alt=""
                          />
                        </td>
                        <td className="text-black border-b font-medium">{data.address}</td>
                        <td className="text-black border-b font-medium">{data.email}</td>
                        <td className="text-black border-b font-medium">
                          <button
                            className="button font-bold text-green-500"
                            onClick={() => handleAccept(data.id)}
                          >
                            Accept Partnership
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-black">
                      <td colSpan="5" className="text-black border-b font-medium">
                        No partnership requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-5 mt-20 ml-10 text-center">Registered Partners</h2>
          <div className="card mb-5">
            <div className="container">
              <table className="w-full table-auto text-white text-center driver mt-3 ml-10">
                <thead className="bg-cyan-950">
                  <tr>
                    <th className="px-4 py-2 border-b font-semibold">Company Name</th>
                    <th className="px-4 py-2 border-b font-semibold">Image</th>
                    <th className="px-4 py-2 border-b font-semibold">Address</th>
                    <th className="px-4 py-2 border-b font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white border-b">
                  {partner.map((data) => (
                    <tr key={data.id}>
                      <td className="text-black border-b font-medium">{data.name}</td>
                      <td className="text-black border-b font-medium">
                        <img
                          className="h-16 w-16 object-contain"
                          src={`data:image/jpeg;base64,${data?.profilePicture}`}
                          alt=""
                        />
                      </td>
                      <td className="text-black border-b font-medium">{data.address}</td>
                      <td className="text-black border-b font-medium">{data.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Partners;
