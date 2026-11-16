import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CBadge, CNavItem } from '@coreui/react';

// Mapping of parent routes to their child routes
const parentChildRouteMap = {
  '/mypatients': ['/mypatients/details'],
  '/coachPatients': ['/coachPatientDetail'],
  '/patients': ['/admin/patient-detail', '/clinic/patient-detail'],
  '/users': ['/users/userDetail'],
  '/clinics': ['/clinics/clinicDetail'],
  '/task': ['/task-details'],
  '/Task': ['/task-details'],
};

export const AppSidebarNav = ({ items }) => {
  const location = useLocation();

  const navLink = (name, icon, badge) => (
    <>
      {icon && icon}
      <div className="nav-text">{name}</div>
      {badge && (
        <CBadge color={badge.color} className="ms-auto">
          {badge.text}
        </CBadge>
      )}
    </>
  );

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    
    // Check if current path starts with the route path
    if (location.pathname.startsWith(path)) {
      return true;
    }
    
    // Check if current path ends with the route path (for cases like /admin/bill-status matching /bill-status)
    if (location.pathname.endsWith(path) && location.pathname !== path) {
      return true;
    }
    
    // Check if current path matches any child routes of this parent
    const childRoutes = parentChildRouteMap[path];
    if (childRoutes) {
      return childRoutes.some(childPath => location.pathname === childPath || location.pathname.startsWith(childPath));
    }
    
    // Also check if current path is a child of any parent route
    // This handles cases where we're on /admin/bill-status and checking if /bill-status should be active
    for (const [parentPath, children] of Object.entries(parentChildRouteMap)) {
      if (children.includes(location.pathname) && path === parentPath) {
        return true;
      }
    }
    
    return false;
  };


  const navItem = (item, index) => {
    const { name, badge, icon, to } = item;
    return (
      <CNavItem key={index}>
        <NavLink
          to={to}
          className={() => (isActiveRoute(to) ? 'nav-link active' : 'nav-link')}
          end={false}
        >
          {navLink(name, icon, badge)}
          {isActiveRoute(to) && (
            <div className="active-indicator"></div>
          )}
        </NavLink>
      </CNavItem>
    );
  };

  const navGroup = (item, index) => {
    const { name, icon, items } = item;
    const isParentActive = items.some((subItem) => isActiveRoute(subItem.to));

    return (
      <div key={index} className={`nav-group ${isParentActive ? 'active' : ''}`}>
        <span className="nav-group-header">
          {navLink(name, icon)}
          {isParentActive && (
            <div className="active-indicator"></div> /* Add indicator for active parent */
          )}
        </span>
        {items.map((subItem, subIndex) => navItem(subItem, subIndex))}
      </div>
    );
  };

  return (
    <>
      {items?.map((item, index) =>
        item.items ? navGroup(item, index) : navItem(item, index)
      )}
    </>
  );
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
