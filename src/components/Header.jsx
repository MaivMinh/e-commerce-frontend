import { Button, Dropdown, Space } from "antd";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const items = [
  {
    key: "1",
    label: <a href="https://www.antgroup.com">Thể loại phim</a>,
  },
  {
    key: "2",
    label: <a href="https://www.antgroup.com">Diễn viên</a>,
  },
  {
    key: "3",
    label: <a href="https://www.antgroup.com">Đạo diễn</a>,
  },
  {
    key: "4",
    label: <a href="https://www.antgroup.com">Trailer</a>,
  },
  {
    key: "5",
    label: <a href="https://www.antgroup.com">Tin tức</a>,
  },
  {
    key: "6",
    label: <a href="https://www.antgroup.com">Thể loại phim</a>,
  },
];

const events = [
  {
    key: "1",
    label: <a href="https://www.antgroup.com">Trò chơi</a>,
  },
  {
    key: "2",
    label: <a href="https://www.antgroup.com">Khuyến mãi</a>,
  },
];

const cinemas = [
  {
    key: "1",
    label: <a href="https://www.antgroup.com">Galaxy Mipect Long Biên</a>,
  },
  {
    key: "2",
    label: <a href="https://www.antgroup.com">Galaxy Tân Bình</a>,
  },
];

const Header = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const login = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full min-h-20 h-6  py-4 flex flex-row rounded-b-xl border-[#ebebeb] border-b-2">
      <div className="w-full h-full mx-auto max-w-[1280px]">
        <nav className="flex flex-row justify-between items-center">
          <button onClick={() => navigate("/home")} className="cursor-pointer">
            <img
              src={
                "https://www.galaxycine.vn/_next/static/media/galaxy-logo-mobile.074abeac.png"
              }
              alt="galaxy logo"
              className="w-[115px] h-[60px] ml-4 mr-12"
            />
          </button>
          <div className="flex flex-row justify-center items-center min-w-[700px] gap-x-10">
            <a className="mr-4" href="/bookings">
              <img
                src={
                  "https://www.galaxycine.vn/_next/static/media/btn-ticket.42d72c96.webp"
                }
                alt="Mua vé"
                className="w-[112px] h-[36px]"
              />
            </a>
            <div className="text-black cursor-pointer">
              <Dropdown
                menu={{
                  items,
                }}
                disabled={false}
                placement="bottom"
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Space>Góc điện ảnh</Space>
                </a>
              </Dropdown>
            </div>
            <div className="text-black cursor-pointer">
              <Dropdown
                menu={{
                  items: events,
                }}
                placement="bottom"
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Space>Sự kiện</Space>
                </a>
              </Dropdown>
            </div>
            <div className="text-black cursor-pointer">
              <Dropdown
                menu={{
                  items: cinemas,
                }}
                placement="bottom"
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Space>Rạp/ Giá vé</Space>
                </a>
              </Dropdown>
            </div>
          </div>
          <div className="mr-4 flex flex-row justify-end items-center">
            {auth.isAuthenticated && (
              <Button
                onClick={handleLogout}
                color="orange"
                variant="solid"
                style={{
                  fontSize: "16px",
                  fontWeight: "450",
                }}
              >
                Đăng xuất
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;