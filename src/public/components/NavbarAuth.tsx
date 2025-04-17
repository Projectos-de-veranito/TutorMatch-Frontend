export default function NavbarAuth() {


  return (
    <header className="bg-dark-light p-4 flex flex-wrap justify-between items-center border-b border-dark-border relative">
      <a href="/" className="flex items-center">
        <img
          src="/public/assets/imgs/TutorMatch.webp"
          alt="TutorMatch Logo"
          width={40}
          height={40}
          className="mr-2"
        />
        <span className="text-light text-xl font-bold">TutorMatch</span>
      </a>
    </header>
  );
}