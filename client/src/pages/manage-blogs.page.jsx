
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { API_URL } from '../../config';
import { useContext } from 'react';
import { UserContext } from './../App';
import filterPaginationData from '../common/filter-pagination-data';
import { ManageDraftBlogCard } from '../components/manage-blogcard.component';
import InPageNavigation from '../components/inpage-navigation.component';
import ManagePublishedBlogCard from '../components/manage-blogcard.component';
import NoDataMessage from '../components/nodata.component';
import Loader from '../components/loader.component';

const ManageBlogs = () => {
    const [blogs, setBlogs] = useState(null);
    const [drafts, setDrafts] = useState(null);
    const [query, setQuery] = useState("");

    const { userAuth, setUserAuth, userAuth: { access_token } } = useContext(UserContext);
    const getBlogs = ({ page, draft, deleteDocCount = 0 }) => {
        try {
            axios.post(`${API_URL}/user-written-blogs`, {
                page, draft, query, deleteDocCount
            }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }).then(async ({ data }) => {
                let formattedData = await filterPaginationData({
                    state: draft ? drafts : blogs,
                    data: data.blogs,
                    page,
                    user: access_token,
                    countRoute: "/user-written-blogs-count",
                    data_to_send: { draft, query }
                });
                if (draft) {
                    setDrafts(formattedData);
                } else {
                    setBlogs(formattedData);
                }
            })

        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        if (access_token) {
            if (blogs == null) getBlogs({ page: 1, draft: false });
            if (drafts == null) getBlogs({ page: 1, draft: true });
        }
    }, [access_token, blogs, drafts, query]);

    const handleSearch = (e) => {
        let val = e.target.value;
        setQuery(val);
        if (e.keyCode == 13 && val.trim().length > 0) {
            setBlogs(null);
            setDrafts(null);
        }
    }

    const handleChange = (e) => {
        if (!e.target.value.length) {
            setQuery("");
            setBlogs(null);
            setDrafts(null);
        }
    }
    return (
        <div>

            <h1 className='max-md:hidden'>Manage Blogs</h1>

            <div className='relative max-md:mt-5 md:mt-8 mb-10'>
                <input type="search" onChange={handleChange} onKeyDown={handleSearch} placeholder='Search Blogs' className='w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey' />
                <i className='fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey'></i>
            </div>

            <InPageNavigation routes={["Published Blogs", "Drafts"]}>
                {
                    blogs == null ? <Loader />
                        : blogs.results.length ?
                            <>
                                {
                                    blogs.results.map((ele, index) => {
                                        return <ManagePublishedBlogCard key={index} blog={{ ...ele, index: index, setStateFuc: setBlogs }} />
                                    })
                                }</> : <NoDataMessage message={"No published blogs"} />
                }

                {
                    drafts == null ? <Loader />
                        : drafts.results.length ?
                            <>
                                {
                                    drafts.results.map((ele, index) => {
                                        return <ManageDraftBlogCard key={index} blog={{ ...ele, index: index, setStateFuc: setDrafts }} />
                                    })
                                }</> : <NoDataMessage message={"No drafts blogs"} />
                }
            </InPageNavigation>

        </div>
    )
}

export default ManageBlogs
