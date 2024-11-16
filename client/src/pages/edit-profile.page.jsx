
import React, { useContext, useEffect, useRef, useState } from 'react';
import InputBox from "./../components/input.component";
import axios from 'axios';
import { API_URL } from '../../config';
import { UserContext } from '../App';
import toast from 'react-hot-toast';
import Loader from '../components/loader.component';
import { ProfileData } from './profile.page';
import { storeInSession } from '../common/session';

let bioLimit = 150;

const EditProfile = () => {
    const { userAuth, userAuth: { access_token }, setUserAuth } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(ProfileData);
    const [charactersLeft, setcharactersLeft] = useState(bioLimit);
    const [updatedProfileImg, setUpdatedProfileImg] = useState(null);

    let { personal_info: { fullname, username, profile_img, email, bio }, social_links } = profile;

    useEffect(() => {
        if (access_token) {
            setLoading(true);
            axios.post(`${API_URL}/get-profile`, { username: userAuth.username }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }).then((res) => {
                setLoading(false);
                setProfile(res.data);
            })
        }
    }, [access_token])

    const handleCharacterChange = (e) => {
        setcharactersLeft(bioLimit - e.target.value.length);
    }

    let profileImgFile = useRef();
    const handleImagePreview = (e) => {
        const img = e.target.files[0];

        if (img) {
            profileImgFile.current.src = URL.createObjectURL(img);
            setUpdatedProfileImg(img);
        }
    };

    const handleImgUpload = async (e) => {
        e.preventDefault();
        if (updatedProfileImg) {
            const loadingToast = toast.loading("Uploading...");
            e.target.setAttribute("disabled", true);
            try {
                const formData = new FormData();
                formData.append("banner", updatedProfileImg);
                const response = await fetch(`${API_URL}/uploadProfile`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setProfile((prevProfile) => ({
                        ...prevProfile,
                        personal_info: { ...prevProfile.personal_info, profile_img: data.imageUrl }
                    }));

                    let newUserAuth = { ...userAuth, profile_img: data.imageUrl };
                    storeInSession("user", JSON.stringify(newUserAuth));

                    setUserAuth(newUserAuth);
                    setUpdatedProfileImg(null);

                    toast.dismiss(loadingToast);
                    toast.success("Uploaded successfully!");

                } else {
                    toast.dismiss(loadingToast);
                    toast.error("Failed to upload image");
                }
            } catch (error) {
                toast.dismiss(loadingToast);
                console.error("Error uploading image:", error);
                toast.error("Image upload failed");
            } finally {
                e.target.removeAttribute("disabled");
            }
        }
    };

    let editProfileForm = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Uploading...");
        try {
            const form = new FormData(editProfileForm.current);
            const formData = Object.fromEntries(form.entries());

            const { username, bio, youtube, facebook, twitter, github, instagram, website } = formData;

            if (username.length < 3) {
                return toast.error("Username should be at least 3 characters long");
            }


            e.target.setAttribute("disabled", true);

            const { data } = await axios.post(`${API_URL}/update-profile`, {
                username, bio,
                social_links: { youtube, facebook, twitter, github, instagram, website }
            }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            if (userAuth.username !== data.username) {
                const newUserAuth = { ...userAuth, username: data.username };
                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);
            }

            toast.dismiss(loadingToast);
            toast.success("Profile Updated");
        } catch (error) {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");

            if (error.response) {
                toast.error(error.response.data.error || "An error occurred");
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            e.target.removeAttribute("disabled");
        }
    };


    return (
        <div>
            {
                loading ? <Loader /> :
                    <form ref={editProfileForm}>
                        <h1 className='max-md:hidden text-xl'>Edit Profile</h1>

                        <div className='flex flex-col lg:flex-row item-start py-10 gap-8 lg:gap-10'>
                            <div className='max-lg:center mb-5'>
                                <label htmlFor="uploadImg" id="profileImgLabel" className='relative block w-48 h-48 bg-grey rounded-full overflow-hidden'>
                                    <img src={profile_img} ref={profileImgFile} alt="" className='relative block w-48 h-48 bg-grey rounded-full overflow-hidden' />
                                    <div className='w-full h-full opacity-0 hover:opacity-100 absolute top-0 left-0 flex items-center justify-center text-white bg-black cursor-pointer'>
                                        Upload Image
                                    </div>

                                </label>
                                <input type="file" id="uploadImg" accept='.jpeg .png .jpg' hidden onChange={handleImagePreview} />

                                <button className='btn-light mt-5 max-lg:center lg:w-full px-10' onClick={handleImgUpload}>Upload</button>

                            </div>
                            <div className='w-full '>
                                <div className='grid grid-cols-1 md:grid-cols-2 md:gap-5'>

                                    <div>
                                        <InputBox name="fullname" type="text" value={fullname} placeholder="Full Name" disable={true} icon={"fi-rr-user"} />
                                    </div>


                                    <div>
                                        <InputBox name="email" type="email" value={email} placeholder="Email" disable={true} icon={"fi-rr-envelope"} />
                                    </div>

                                    <InputBox name="username" type="text" value={username} placeholder="Username" icon={"fi-rr-at"} />

                                    <p className='text-dark-grey -mt-3'>Username will use to search users and will be visible to all users</p>

                                    <textarea name="bio" defaultValue={bio} className='inout-box h-64 bg-grey p-2 lg:h-40 resize-none mt-5 pl-5 leading-7' placeholder='Bio' maxLength={bioLimit} onChange={handleCharacterChange}></textarea>
                                    <p>{charactersLeft} characters left</p>

                                    <p className='my-6 text-dark-grey'>Add your social handles below</p>

                                    <div className='md:grid md:grid-cols-2 gap-x-6 '>
                                        {
                                            Object.keys(social_links).map((key, index) => {
                                                let link = social_links[key];
                                                return <div className='flex flex-col'> 
                                                <p className='mb-1 capitalize'>{key} </p>
                                                    <InputBox placeholder={"Paste link here"} key={index} name={key} type="text" value={link}
                                                        icon="fi" />
                                                </div>
                                            })
                                        }
                                    </div>

                                    <button className='btn-dark w-auto px-10' type='submit' onClick={handleSubmit}>Update</button>


                                </div>
                            </div>
                        </div>
                    </form>
            }
        </div>
    )
}

export default EditProfile
