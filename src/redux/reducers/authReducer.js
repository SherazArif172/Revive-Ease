

let info = localStorage.getItem("state");
let userInfo = JSON.parse(info);

export const getLocalData = (state = {}, { type, payload }) => {
    return { ...state,userInfo};
}