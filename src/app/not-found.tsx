export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="font-serif text-4xl md:text-6xl text-champagne mb-4">Page Not Found</h2>
        <p className="text-xl text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <a 
          href="/" 
          className="bg-champagne text-black font-bold py-3 px-8 rounded-full hover:bg-champagne/90 transition-all"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}
