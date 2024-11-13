

import React from 'react'

const Img = ({ url, caption }) => {
    return (
        <div>
            <img src={url} alt="" />
            {caption.length > 0 ? <p className='w-full text-center my-3 md:mb-12 text-dark-grey'>{caption}</p> : ""}
        </div>
    )
}

const Quote = ({ quote, caption }) => {
    return (
        <div className='bg-purple-30/10 p-3 pl-5 border-l-4 border-purple-30'>
            <p className='text-xl leading-10 md:text-2xl'>{quote}</p>
            {caption.length > 0 ? <p className='w-full text-purple-30 text-base'></p> : ""}
        </div>
    )
}

const List = ({ style, items }) => {
    return (
        <ol className='pl-5 list-disc'>
            {
                items.map((ele, index) => {
                    return <li key={index} className='my-4' dangerouslySetInnerHTML={{ __html: ele }}></li>
                })
            }
        </ol>
    )
}

const BlogContent = ({ block }) => {
    const { type, data } = block;
    if (type == "paragraph") {
        return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>
    }
    if (type == "header") {
        if (data.level == 3) {
            return <h3 className='text-3xl font-blod' dangerouslySetInnerHTML={{ __html: data.text }}></h3>
        }
        return <h2 className='text-3xl font-blod' dangerouslySetInnerHTML={{ __html: data.text }}></h2>
    }

    if (type == "image") {
        return <Img url={data.file.url} caption={data.caption}></Img>
    }

    if (type == "quote") {
        return <Quote qutoe={data.text} caption={data.caption} />
    }

    if (type == "list") {
        return <List style={data.style} items={data.items} />
    }

    return (
        <div>

        </div>
    )
}

export default BlogContent
