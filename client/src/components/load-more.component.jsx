const LoadMoreData = ({ state, fetchDataFun, additionalParams }) => {
    if (state != null && state.totalDocs > state.results.length) {
        return (
            <button
                onClick={() => fetchDataFun({ ...additionalParams, page: state.page + 1 })} // Pass a function reference here
                className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
            >
                Load More..
            </button>
        )
    }

    return null; // Return null if no more data to load
}

export default LoadMoreData;
