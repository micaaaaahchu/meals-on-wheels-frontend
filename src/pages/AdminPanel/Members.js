import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Layout from "../../components/Layout";
import ForbiddenPage from "../ForbiddenPage";
import { getAdminUserAPI, getAdminUserActiveAPI } from '../../api/admin-api';
import { user_type } from "../../context/context-type";
import { useAuthUser } from "react-auth-kit";
import { getProfile } from '../../api/profile-api';
import { useNavigate } from 'react-router-dom';

const Members = () => {
  const [users, setUsers] = useState([user_type]);
  const auth = useAuthUser();
  const isAdmin = auth()?.role?.[0] === "ROLE_ADMIN";
  const token = auth()?.token;
  const [profile, setProfile] = useState({});
  const role = auth()?.role[0];
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(null);
  const [msg, setMsg] = useState("");


  const handleOpen = (index) => {
    setIsOpen(index)

  }

  const fetchData = async () => {
    if (!auth()) {
      navigate("/login");
    }
    const userEmail = auth()?.email;
    const res = await getProfile(userEmail, role)
      .catch((error) => {
        console.error("Error fetching profile:", error);
        // Handle the error, such as setting a default profile or showing an error message
      });
    if (res) {
      setProfile(res);
      // Rest of your code here
    }
  };


  function handleActive(id) {
    getAdminUserActiveAPI(token, id)
      .then((resp) => setMsg(resp.data.message))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchData();
    getAdminUserAPI(token)
      .then((resp) => setUsers(resp.data))
      .catch((err) => console.log(err));
  }, [token]);

  // if user not admin forbid access
  if (!isAdmin) {
    return <ForbiddenPage />;
  }

  return (
    <Layout>
      <div className="flex min-h-screen mr-5">
        <Sidebar />
        <div className="flex-1 p-4">
          <h1 className="text-3xl font-bold mb-10 mt-10 text-center">Users Management</h1>

          <h2 className="text-2xl font-bold mb-5 ml-10 text-center mt-10">Users</h2>
          {/* Members table */}
          <div className="card mb-5">
            <div className="container">
              <table className="w-full table-auto text-white text-center driver mt-3 ml-10">
                <thead className="bg-cyan-950">
                  <tr>
                    <th className="px-4 py-2 border-b font-semibold">No</th>
                    <th className="px-4 py-2 border-b font-semibold">Name</th>
                    <th className="px-4 py-2 border-b font-semibold">Address</th>
                    <th className="px-4 py-2 border-b font-semibold">Email</th>
                    <th className="px-4 py-2 border-b font-semibold">Gender</th>
                    <th className="px-4 py-2 border-b font-semibold">Roles</th>
                    <th className="px-4 py-2 border-b font-semibold">File</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td className="text-black border-b font-medium">{index + 1}</td>
                      <td className="text-black border-b font-medium">{user.name}</td>
                      <td className="text-black border-b font-medium">{user.address}</td>
                      <td className="text-black border-b font-medium">{user.email}</td>
                      <td className="text-black border-b font-medium">{user.gender}</td>
                      <td className="text-black border-b font-medium">{user.role}</td>
                      <td className="text-black border-b font-medium">
                        <a className="text-blue-500 font-medium" href={user.qualification}>
                          Qualification
                        </a>
                      </td>
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

export default Members;
