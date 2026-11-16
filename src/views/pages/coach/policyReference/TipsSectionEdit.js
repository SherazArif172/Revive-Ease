import React, { useEffect, useState } from 'react';
import { useUpdateTipsMutation } from '../../../../redux/apis/tips_api';
import { useSelector } from 'react-redux';

const TipsSectionEdit = ({ selectedRow, setEditCanva, }) => {
    const [updateTips, { isSuccess, isLoading }] = useUpdateTipsMutation();
    const actorType = useSelector((state) => state?.user?.userType);
    const actorId = useSelector((state) => state?.user?.id);

    const [btnTipDisable, setBtnTipDisable] = useState(false);
    const [tipsFormData, setTipsFormData] = useState({
        title: '',
        sub_title: '',
        body_text: '',
        actorType: '',
        actorId: '',
    });

    useEffect(() => {
        if (isLoading) {
            setBtnTipDisable(true);
        }
        else {
            setBtnTipDisable(false);
        }
    }, [isLoading]);

    useEffect(() => {
        if (selectedRow) {
            setTipsFormData({
                title: selectedRow?.title,
                sub_title: selectedRow?.sub_title,
                body_text: selectedRow?.body_text,
                actorType: actorType,
                actorId: actorId,
            });
        }
    }, [selectedRow, actorType, actorId]);

    useEffect(() => {
        if (isSuccess) {
            setEditCanva(false);
            setTipsFormData();
        }
    }, [isSuccess]);

    const tipsHandleChange = (e) => {
        const { name, value } = e.target;
        setTipsFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateTips({ data: tipsFormData, id: selectedRow?._id, status: "Edit" });
    };

    return (
        <>
            <div className="row">
                <div className="col">
                    <label htmlFor="documentName">Title *</label>
                    <input
                        type="text"
                        name="title"
                        className="form-control form-control-input"
                        value={tipsFormData?.title}
                        defaultValue={tipsFormData?.title}
                        onChange={tipsHandleChange}
                    />
                </div>
                <div className="col">
                    <label htmlFor="documentName">Sub Title</label>
                    <input
                        type="text"
                        name="sub_title"
                        className="form-control form-control-input"
                        value={tipsFormData?.sub_title}
                        defaultValue={tipsFormData?.sub_title}
                        onChange={tipsHandleChange}
                    />
                </div>
            </div>
            <div className="row pt-4">
                <div className="col-md-12">
                    <label htmlFor="userType">Body Text</label>
                    <input
                        type="text"
                        name="body_text"
                        className="form-control form-control-input"
                        style={{ border: '1px solid #DEE2E6' }}
                        value={tipsFormData?.body_text}
                        defaultValue={tipsFormData?.body_text}
                        onChange={tipsHandleChange}
                    />
                </div>
            </div>
            <div className="col-md-12 pt-2 text-end">
                <button className="btn cncl-patient-btn" onClick={() => {
                    setTipsFormData({
                        title: selectedRow?.title || "",
                        sub_title: selectedRow?.sub_title || "",
                        body_text: selectedRow?.body_text || "",
                        actorType: actorType,
                        actorId: actorId,
                    });
                    setEditCanva(false);
                }}>
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn add-section-btn ms-2"
                    onClick={handleSubmit}
                    disabled={btnTipDisable === true}
                >
                    Update
                </button>
            </div>
        </>
    );
};

export default TipsSectionEdit;

