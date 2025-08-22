const AuthLayout = ({ children }) => {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  };
  
  export default AuthLayout;
  