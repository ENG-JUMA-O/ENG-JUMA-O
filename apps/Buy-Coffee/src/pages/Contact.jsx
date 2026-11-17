
import React from 'react';
import ProjectForm from '../components/contact/ProjectForm';

const Contact = ({ onReceipt, onMessage }) => {
  const data = {
    username: 'ENG-JUMA-O',
    name: 'Douglas Oroko',
    avatar: 'https://github.com/ENG-JUMA-O.png',
    bio: 'Software Developer passionate about building modern applications and solving real-world problems.',
    location: 'Kenya',
    website: 'https://github.com/ENG-JUMA-O',
    followers: 5601,
    following: 25,
    publicRepositories: 15,
    totalStars: 180,
  };

  return (
    <section className="contact-background relative isolate min-h-screen w-full overflow-hidden bg-[#050605] px-5 py-12 text-white sm:px-8 lg:px-[6%] lg:py-16">

      {/* Animated Background */}
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />
      <div className="background-glow glow-three" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1250px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">

        {/* Left Content */}
        <div className="flex flex-col items-center text-center">

          {/* Profile */}
          <div className="mb-7 flex flex-col items-center gap-4">
            <img
              src={data.avatar}
              alt={data.name}
              className="h-40 w-40 rounded-full border-4 border-blue-400 object-cover shadow-[0_0_0_7px_rgba(96,165,250,0.12),0_0_35px_rgba(96,165,250,0.15)] sm:h-48 sm:w-48"
            />

            <div>
              <h2 className="text-lg font-bold text-white sm:text-xl">
                {data.name}
              </h2>

              <a
                href={`https://github.com/${data.username}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-xs text-blue-300 transition hover:text-blue-200"
              >
                @{data.username}
              </a>
            </div>
          </div>

          {/* GitHub Statistics */}
          <div className="mb-6 grid w-full max-w-md grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <strong className="text-base font-bold text-white">
                {data.followers.toLocaleString()}
              </strong>
              <span className="text-[10px] text-gray-400">Followers</span>
            </div>

            <div className="flex flex-col gap-1">
              <strong className="text-base font-bold text-white">
                {data.following.toLocaleString()}
              </strong>
              <span className="text-[10px] text-gray-400">Following</span>
            </div>

            <div className="flex flex-col gap-1">
              <strong className="text-base font-bold text-white">
                {data.publicRepositories.toLocaleString()}
              </strong>
              <span className="text-[10px] text-gray-400">Repositories</span>
            </div>

            <div className="flex flex-col gap-1">
              <strong className="text-base font-bold text-white">
                {data.totalStars.toLocaleString()}
              </strong>
              <span className="text-[10px] text-gray-400">Stars</span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="mb-7 flex flex-wrap items-center justify-center gap-5 text-[11px] text-gray-400">
            {data.location && (
              <span>📍 {data.location}</span>
            )}

            {data.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noreferrer"
                className="text-blue-300 transition hover:text-blue-200"
              >
                ↗ Visit Website
              </a>
            )}
          </div>

          {/* Benefits */}
          <div className="mb-7 flex w-full max-w-md flex-col gap-4 text-left">
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-blue-300">✓</span>
              <p className="text-xs leading-relaxed text-gray-300">
                Expect A Response From Us Within 24 Hours
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-blue-300">✓</span>
              <p className="text-xs leading-relaxed text-gray-300">
                We Can Sign An NDA Before We Discuss Your Project.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-blue-300">✓</span>
              <p className="text-xs leading-relaxed text-gray-300">
                Access To Dedicated Product Specialists
              </p>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full rounded-xl border border-[#343a36]/80 bg-[#171918]/85 p-5 shadow-[0_15px_50px_rgba(96,165,250,0.08)] backdrop-blur-xl sm:p-7">
          <ProjectForm
            onReceipt={onReceipt}
            onMessage={onMessage}
          />
        </div>

      </div>
    </section>
  );
};

export default Contact;
