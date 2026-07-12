'use client';

import React from 'react';

export default function RightSidebar() {
  return (
    <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
      <div className="_layout_right_sidebar_wrap">
        <div className="_layout_right_sidebar_inner">
          <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area bg-white border">
            <div className="_right_inner_area_info_content _mar_b24 d-flex justify-content-between align-items-center">
              <h4 className="_right_inner_area_info_content_title _title5" style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>You Might Like</h4>
              <a className="_right_inner_area_info_content_txt_link text-decoration-none text-xs text-success font-semibold" href="#0">See All</a>
            </div>
            <hr className="_underline" />
            <div className="_right_inner_area_info_ppl mb-3">
              <div className="_right_inner_area_info_box d-flex align-items-center gap-2 mb-2">
                <img src="/assets/images/Avatar.png" alt="Image" className="_ppl_img" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                <div className="_right_inner_area_info_box_txt">
                  <h4 className="_right_inner_area_info_box_title" style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>Radovan SkillArena</h4>
                  <p className="_right_inner_area_info_box_para" style={{ fontSize: '10px', color: '#999', margin: 0 }}>Founder & CEO at Trophy</p>
                </div>
              </div>
              <div className="_right_info_btn_grp d-flex gap-2">
                <button type="button" className="btn btn-light btn-sm text-xs font-semibold py-1 px-3">Ignore</button>
                <button type="button" className="btn btn-emerald text-white btn-sm text-xs font-semibold py-1 px-3" style={{ backgroundColor: '#10b981' }}>Follow</button>
              </div>
            </div>
          </div>
        </div>

        <div className="_layout_right_sidebar_inner mt-3">
          <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area bg-white border">
            <div className="_feed_top_fixed">
              <div className="_feed_right_inner_area_card_content _mar_b24 d-flex justify-content-between align-items-center">
                <h4 className="_feed_right_inner_area_card_content_title _title5" style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>Your Friends</h4>
                <a className="_feed_right_inner_area_card_content_txt_link text-decoration-none text-xs text-success font-semibold" href="/feed">See All</a>
              </div>
              <form className="_feed_right_inner_area_card_form position-relative mb-3">
                <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="7" cy="7" r="6" stroke="#666" />
                  <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
                </svg>
                <input className="form-control me-2 _feed_right_inner_area_card_form_inpt" type="search" placeholder="input search text" style={{ paddingLeft: '32px', fontSize: '12px' }} />
              </form>
            </div>
            <div className="_feed_bottom_fixed" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <div className="_feed_right_inner_area_card_ppl d-flex justify-content-between align-items-center mb-3">
                <div className="_feed_right_inner_area_card_ppl_box d-flex align-items-center gap-2">
                  <img src="/assets/images/people1.png" alt="" className="_box_ppl_img" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div className="_feed_right_inner_area_card_ppl_txt">
                    <h4 className="_feed_right_inner_area_card_ppl_title" style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>Steve Jobs</h4>
                    <p className="_feed_right_inner_area_card_ppl_para" style={{ fontSize: '10px', color: '#999', margin: 0 }}>CEO of Apple</p>
                  </div>
                </div>
                <div className="_feed_right_inner_area_card_ppl_side"><span style={{ fontSize: '9px', color: '#999' }}>5 min ago</span></div>
              </div>
              <div className="_feed_right_inner_area_card_ppl d-flex justify-content-between align-items-center mb-3">
                <div className="_feed_right_inner_area_card_ppl_box d-flex align-items-center gap-2">
                  <img src="/assets/images/people2.png" alt="" className="_box_ppl_img" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div className="_feed_right_inner_area_card_ppl_txt">
                    <h4 className="_feed_right_inner_area_card_ppl_title" style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>Ryan Roslansky</h4>
                    <p className="_feed_right_inner_area_card_ppl_para" style={{ fontSize: '10px', color: '#999', margin: 0 }}>CEO of Linkedin</p>
                  </div>
                </div>
                <div className="_feed_right_inner_area_card_ppl_side">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <rect width="12" height="12" x="1" y="1" fill="#0ACF83" stroke="#fff" strokeWidth="2" rx="6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
