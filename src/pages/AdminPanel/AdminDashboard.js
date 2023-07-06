import { useEffect, useState } from "react";
import React from "react";
import { FaUsers, FaCar, FaHandsHelping, FaHandshake } from 'react-icons/fa';
import { getAllMenu } from "../../api/main-api";
import {
  addMenu,
  getAdminOrderPendingAPI,
  getAdminOrderReadyToDeliverAPI,
  getAdminUserCountAPI,
  getPartnersAPI,
  getDriversAPI,
  postAdminOrderDeliverAPI,
  postAdminOrderPrepareAPI,
  getAdminUserActiveAPI,
  getAdminUserAPI,
  assignVolunteerAPI,
} from "../../api/admin-api";
import redCircle from "../../assets/images/red-circle.svg";
import Layout from "../../components/Layout";
import Sidebar from "./Sidebar";
import { menu_type, order_type, user_count, user_type } from "../../context/context-type";
import { useAuthUser } from "react-auth-kit";
import { getProfile } from '../../api/profile-api';
import { useNavigate } from 'react-router-dom';
import AddMealModal from '../../components/modal/AddMealModal';
import Qualification from "../../components/Qualification";

const AdminDashboard = () => {
  const auth = useAuthUser();
  const token = auth()?.token;
  const [profile, setProfile] = useState({});
  const role = auth()?.role[0];
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const [orderList, setOrderList] = useState([order_type]);
  const [deliverList, setDeliverList] = useState([order_type]);
  const [users, setUsers] = useState([user_type]);
  const [volunteers, setVolunteers] = useState([user_type]);
  const [drivers, setDriver] = useState([user_type]);
  const [partners, setPartner] = useState([user_type]);
  const [userCount, setUserCount] = useState(user_count);
  const [menu, setMenu] = useState([menu_type]);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(null);
  const [msg, setMsg] = useState("");
  const [isAssign, setIsAssign] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openQualification, setOpenQualification] = useState(null);

  const handleOpen = (index) => {
    setIsOpen(index)

  }

  const handleOpenQualification = (index) => {
    setOpenQualification(index)
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



  const handleCloseQualification = () => {
    setOpenQualification(null);
  };

  function handlePrepare(order, user) {
    postAdminOrderPrepareAPI(token, order, user)
      .then((resp) => setIsAssign(!isAssign))
      .catch((err) => console.log(err));
  }

  function handleDeliver(order, user) {
    postAdminOrderDeliverAPI(token, order, user)
      .then((resp) => setIsAssign(!isAssign))
      .catch((err) => console.log(err));
  }

  function handleActive(id) {
    getAdminUserActiveAPI(token, id)
      .then((resp) => setMsg(resp.data.message))
      .catch((err) => console.log(err));
  }

  function handleAssignRole(id, rolecode) {
    assignVolunteerAPI(token, id, rolecode)
      .then((resp) => setMsg(resp.data.message))
      .catch((err) => console.log(err));

  }

  useEffect(() => {
    // Fetch order lists
    getAdminOrderPendingAPI(token)
      .then((resp) => setOrderList(resp.data))
      .catch((err) => console.log(err));
    console.log(orderList)

    getAdminOrderReadyToDeliverAPI(token)
      .then((resp) => setDeliverList(resp.data))
      .catch((err) => console.log(err));

    // Fetch volunteers and partners
    getDriversAPI(token)
      .then((resp) => setDriver(resp.data))
      .catch((err) => console.log(err));

    getPartnersAPI(token)
      .then((resp) => setPartner(resp.data))
      .catch((err) => console.log(err));

    getAdminUserCountAPI(token)
      .then((resp) => setUserCount(resp.data))
      .catch((err) => console.log(err));

    // Fetch user lists
    getAdminUserAPI(token)
      .then((resp) => {
        resp.data = resp.data
          .filter((item) => {
            return (item.active === false) && !(item.role.localeCompare("ROLE_VOLUNTEER") === 0);
          })
          .map((item) => {
            // setUsers(item);
            console.log(item)
            return item;
          });
        setUsers(resp.data);
      })
      .catch((err) => console.log(err));

    getAdminUserAPI(token)
      .then((resp) => {

        resp.data = resp.data
          .filter((item) => {
            return (item.role.localeCompare("ROLE_VOLUNTEER") === 0);
          })
          .map((item) => {
            // setVolunteers(item);
            console.log(item)
            return item;
          });
        setVolunteers(resp.data);
      })
      .catch((err) => console.log(err));


    // Fetch menu
    getAllMenu(token)
      .then((resp) => setMenu(resp.data))
      .catch((err) => console.log(err));
  }, [isAssign]);



  return (
    <Layout>
      <div className="flex min-h-screen mr-10">
        <Sidebar />
        <div className="flex-1 p-4">
          <h1 className="text-3xl font-bold mb-20 mt-20 text-center">Admin Dashboard</h1>
          <div className="grid grid-cols-4 gap-4 mb-10">
            {/* Members Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl text-blue-700 font-bold mb-4 flex items-center">
                <FaUsers className="mr-2" /> Users
              </h3>
              <p className="text-3xl font-bold">{userCount?.totalUser}</p>
            </div>
            {/* Volunteers Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl text-blue-700 font-bold mb-4 flex items-center">
                <FaHandsHelping className="mr-2" /> Volunteers
              </h3>
              <p className="text-3xl font-bold">{userCount?.totalVolunteer}</p>
            </div>
            {/* Partners Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl text-blue-700 font-bold mb-4 flex items-center">
                <FaHandshake className="mr-2" /> Partners
              </h3>
              <p className="text-3xl font-bold">{userCount?.totalPartner}</p>
            </div>
            {/* Drivers Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl text-blue-700 font-bold mb-4 flex items-center">
                <FaCar className="mr-2" /> Drivers
              </h3>
              <p className="text-3xl font-bold">{userCount?.totalDriver}</p>
            </div>
          </div>

          <div className="md:flex ml-8 mt-20">
            {/* Card Active Account */}
            <div className="md:w-6/12 mr-2">
              <div className="pb-5">
                <h4 className="font-bold text-2xl text-center">Active Account Request</h4>
                <table className="w-full table-auto text-white text-center driver mt-3">
                  <thead className="bg-cyan-950">
                    <tr>
                      <th className="px-4 py-2 border-b font-semibold">Name</th>
                      <th className="px-4 py-2 border-b font-semibold">Role</th>
                      <th className="px-4 py-2 border-b font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-black bg-white">
                    {users && users.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={user.id}>
                          <td className="text-black border-b">{user.name}</td>
                          <td className="text-black border-b">{user.role}</td>
                          <td className="text-black border-b">
                            <div className="relative inline-block">
                              <Qualification closeModal={handleCloseQualification} isOpen={openQualification === user.id} qualification={user.qualification} key={user.id} id={user.id} onClick={() => handleOpenQualification(user.id)} />
                              <button className="bg-blue-500 text-white py-1 px-3 rounded-md" onMouseEnter={() => handleOpen(user.id)}>
                                Select
                              </button>
                              <ul className={`absolute top-0 left-20 ${isOpen === user.id ? "block" : "hidden"} bg-white text-gray-700 py-2 rounded-md shadow-md`}>
                                <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">
                                  <button
                                    className="w-full text-left focus:outline-none"
                                    onClick={() => handleActive(user.id)}
                                  >
                                    Approve
                                  </button>
                                </li>
                                <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">
                                  <button
                                    className="w-full text-left focus:outline-none"
                                    onClick={() => handleOpenQualification(user.id)}
                                  >
                                    Download User File
                                  </button>
                                </li>

                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2 px-4" colSpan="3">
                          No inactive account requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Assign Volunteer Role */}
            <div className="md:w-6/12 mr-2">
              <div className="pb-5">
                <h4 className="font-bold text-2xl text-center">Assign Volunteer Role</h4>
                <table className="w-full table-auto text-white text-center driver mt-3">
                  <thead className="bg-cyan-950">
                    <tr>
                      <th className="px-4 py-2 border-b font-semibold">Name</th>
                      <th className="px-4 py-2 border-b font-semibold">Role</th>
                      <th className="px-4 py-2 border-b font-semibold">Assign Role</th>
                    </tr>
                  </thead>
                  <tbody className="text-black bg-white">
                    {volunteers && volunteers.length > 0 ? (
                      volunteers.map((user) => (
                        <tr key={user.id}>
                          <td className="text-black border-b font-medium">{user.name}</td>
                          <td className="text-black border-b font-medium">{user.role}</td>
                          <td className="text-black border-b font-medium">
                            <div className="relative inline-block">
                              <button className="bg-blue-500 text-white py-1 px-3 rounded-md" onMouseEnter={() => handleOpen(user.id)}>
                                Select
                              </button>
                              <ul className={`absolute top-0 left-20 ${isOpen === user.id ? "block" : "hidden"} bg-white text-gray-700 py-2 rounded-md shadow-md`}>
                                <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">
                                  <button
                                    className="w-full text-left focus:outline-none"
                                    onClick={() => handleAssignRole(user.id, 1)}
                                  >
                                    Assign as Driver
                                  </button>
                                </li>
                                <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">
                                  <button
                                    className="w-full text-left focus:outline-none"
                                    onClick={() => handleAssignRole(user.id, 2)}
                                  >
                                    Assign as Caregiver
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2 px-4" colSpan="3">
                          No volunteers found.
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            </div>
          </div>
          {/* Assign Partner Task */}
          <div className="md:flex ml-8 mt-20">
            <div className="md:w-9/12 mr-4">
              <div className="pb-5">
                <h4 className="font-bold text-2xl text-center">Assign Partner Task</h4>
                <div className="card bg-gray-100 bg-opacity-25">
                  <div className="container">
                    <div className="task-header-div">
                      <table className="w-full table-auto text-white text-center driver my-3 task-header">
                        <thead className="bg-cyan-950">
                          <tr>
                            <th className="px-4 py-2 border-b font-semibold">No</th>
                            <th className="px-4 py-2 border-b font-semibold">Meals Request List</th>
                            <th className="px-4 py-2 border-b font-semibold">Status</th>
                            <th className="px-4 py-2 border-b font-semibold">Assigned Partner</th>
                            <th className="px-4 py-2 border-b font-semibold">Select Partner</th>
                          </tr>
                        </thead>
                        <tbody className="text-black mt-5 bg-white">
                          {orderList.map((order, index) => (
                            <tr key={order.id}>
                              <td className="px-4 py-2 border-b font-medium">{index + 1}</td>
                              <td className="px-4 py-2 border-b font-medium">
                                {order.mealPackage.packageName}
                              </td>
                              <td className="px-4 py-2 border-b font-medium">
                                <div className="status flex justify-center">
                                  <img src={redCircle} alt="" className="status-icon" />
                                  <span className="font-bold ms-3">
                                    {order.orderStatus}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border-b font-medium">
                                {order.preparedBy?.name}
                              </td>
                              <td className="px-4 py-2 border-b font-medium">
                                <div className="relative inline-block text-center">
                                  <div>
                                    <button
                                      key={index}
                                      type="button"
                                      className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      onClick={() => handleOpen(index)}
                                      aria-haspopup="true"
                                      aria-expanded={isOpen}
                                    >
                                      Select
                                    </button>
                                  </div>
                                  {isOpen === index && (
                                    <div
                                      className="top-0 absolute left-20 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
                                      role="menu"
                                      aria-orientation="vertical"
                                    >
                                      {partners.map((partners) => (
                                        <a
                                          href="#/action1"
                                          key={partners.id}
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                          onClick={() => handlePrepare(order.id, partners.id)}
                                        >
                                          {partners.name} {partners.status}
                                        </a>

                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="task-tbl-div">
                      <table className="w-full table-auto text-white text-center driver my-3 task-tbl">
                        <tbody className="text-white">
                          {/* Add table rows here */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Meal Package List */}
            <div className="md:w-3/12 mr-2">
              <div className="pb-5">
                <h4 className="text-center text-2xl font-bold">Meal Package List</h4>
                <table className="w-full table-auto text-white text-center driver mt-3">
                  <thead className="bg-cyan-950">
                    <tr>
                      <th className="px-4 py-2 border-b font-semibold">Meal</th>
                    </tr>
                  </thead>
                  <tbody className="text-black bg-white">
                    {menu.map((data) => (
                      <tr key={data.id}>
                        <td className="text-black border-b font-medium">{data.packageName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-cyan-950 hover:bg-cyan-900 focus:bg-cyan-900 text-white text-sm py-0 px-1 border border-transparent rounded-md shadow-md transition duration-300 ease-in-out mx-auto mt-3 block"
                >
                  + Add Meal Package
                </button>
                {isModalOpen && (
                  <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-primary p-4 rounded-md">
                      <AddMealModal />

                      <div className="w-full col-span-2 flex justify-center">
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="w-full hover:text-red-700 text-gray-900 font-medium py-2 px-4 rounded-md focus:outline-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:flex ml-8 mt-20">
            {/* Assign Driver Task */}
            <div className="md:w-9/12 mr-4">
              <div className="pb-5">
                <h4 className="font-bold text-2xl text-center">Assign Driver Task</h4>
                <div className="card bg-gray-100 bg-opacity-25">
                  <div className="container">
                    <div className="task-header-div">
                      <table className="w-full table-auto text-white text-center driver my-3 task-header">
                        <thead className="bg-cyan-950">
                          <tr>
                            <th className="px-4 py-2 border-b font-semibold">No</th>
                            <th className="px-4 py-2 border-b font-semibold">
                              Meals Request List
                            </th>
                            <th className="px-4 py-2 border-b font-semibold">
                              Status
                            </th>
                            <th className="px-4 py-2 border-b font-semibold">
                              Assigned Driver
                            </th>
                            <th className="px-4 py-2 border-b font-semibold">
                              Select Driver
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-black mt-5 bg-white">
                          {deliverList.map((order, index) => (
                            <tr key={order.id}>
                              <td className="px-4 py-2 border-b">{index + 1}</td>
                              <td className="px-4 py-2 border-b">
                                {order.mealPackage.packageName}
                              </td>
                              <td className="px-4 py-2 border-b">
                                <div className="status flex justify-center">
                                  <img
                                    src={redCircle}
                                    alt=""
                                    className="status-icon"
                                  />
                                  <span className="font-bold ms-3">
                                    {order.orderStatus}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border-b">
                                {order.deliveredBy?.name}
                              </td>
                              <td className="px-4 py-2 border-b">
                                <div className="relative inline-block text-center">
                                  <div>
                                    <button
                                      key={index}
                                      type="button"
                                      className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      id="dropdown-menu-button"
                                      onClick={() => handleOpen(index + order.id)}
                                      aria-haspopup="true"
                                      aria-expanded={isOpen}
                                    >
                                      Select
                                    </button>
                                  </div>
                                  {isOpen === index + order.id && (
                                    <div
                                      className="top-0 absolute left-20 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
                                      role="menu"
                                      aria-orientation="vertical"
                                      aria-labelledby="dropdown-menu-button"
                                    >
                                      {drivers.map((drivers) => (
                                        <a
                                          href="#/action1"
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"

                                          onClick={() => handleDeliver(order.id, drivers.id)}

                                        >
                                          {drivers.name} {drivers.status}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Avability */}
            <div className="md:w-3/12 mr-2">
              <div className="pb-5">
                <h4 className="text-center text-2xl font-bold"> Driver Availability </h4>
                <table className="w-full table-auto text-white text-center driver mt-3">
                  <thead className="bg-cyan-950">
                    <tr>
                      <th className="px-4 py-2 border-b font-semibold">No</th>
                      <th className="px-4 py-2 border-b font-semibold">Name</th>
                      <th className="px-4 py-2 border-b font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-black bg-white">
                    {drivers.map((drivers, index) => (
                      <tr key={drivers.id}>
                        <td className="text-black border-b">{index + 1}</td>
                        <td className="text-black border-b">{drivers.name}</td>
                        <td className="text-black border-b">{drivers.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

