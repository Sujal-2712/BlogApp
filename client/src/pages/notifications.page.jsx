import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from "../App";
import filterPaginationData from '../common/filter-pagination-data';
import { API_URL } from '../../config';
import Loader from '../components/loader.component';
import NoDataMessage from '../components/nodata.component';
import NotificationCard from '../components/notification-card.component';
import LoadMoreData from '../components/load-more.component';

const Notification = () => {
    const [notifications, setNotifications] = useState(null);
    const [filter, setFilter] = useState("all");
    const filters = ["all", "like", "comment", "reply"];
    const { userAuth, setUserAuth, userAuth: { access_token, new_notification_available } } = useContext(UserContext);

    // Handle filter change
    const handleFilter = (e) => {
        const newFilter = e.target.innerHTML;
        setFilter(newFilter);
        setNotifications(null); // Reset notifications when filter changes
    };

    // Fetch notifications from the API
    const fetchNotifications = async ({ page, deletedDocCount = 0 }) => {
        try {
            const result = await axios.post(
                `${API_URL}/notifications`,
                { page, filter, deletedDocCount },
                {
                    headers: { 'Authorization': `Bearer ${access_token}` }
                }
            );    
            const data = result?.data?.notifications;

            if (new_notification_available) {
                setUserAuth({ ...userAuth, new_notification_available: false });
            }
            const finalData = {
                results: data,
            };

            let formattedData = await filterPaginationData({
                state: finalData,
                data,
                page,
                countRoute: "/all-notifications-count",
                data_to_send: { filter },
                user: access_token,
                create_new_arr: true
            });
            console.log(formattedData);

            setNotifications(formattedData);
        } catch (error) {
            console.log("Error fetching notifications:", error);
        }
    };

    // Fetch notifications when access_token is available or when it changes
    useEffect(() => {
        if (access_token) {
            fetchNotifications({ page: 1 });
        }
    }, [access_token, filter]);

    return (
        <div>
            <h1 className='max-md:hidden'>Recent Notifications</h1>
            <div className='my-8 flex gap-6'>
                {filters.map((ele, index) => (

                    <button
                        key={index}
                        onClick={handleFilter}
                        className={'py-2 ' + (filter === ele ? "btn-dark" : "btn-light")}
                    >
                        {ele}
                    </button>
                ))}
            </div>

            {notifications === null ? (
                <Loader />
            ) : (
                <>
                    {notifications.results.length ? (
                        notifications.results.map((ele, i) => (
                            <NotificationCard
                                key={i}
                                data={ele}
                                index={i}
                                notificationState={{ notifications, setNotifications }}
                            />
                        ))
                    ) : (
                        <NoDataMessage message="No Notifications Available" />
                    )}
                </>
            )}

            <LoadMoreData
                state={notifications}
                fetchDataFun={fetchNotifications}
                additionalParams={{ deletedDocCount: notifications ? notifications.deletedDocCount : 0 }}
            />
        </div>
    );
};

export default Notification;
