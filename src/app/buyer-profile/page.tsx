'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LeaderboardEntry {
    rank: number;
    user: string;
    avatar: string;
    totalImpactGenerated: number;
    sredazEarned: number;
    numberOfIpSold: number;
    stakedSredaz: string;
}

interface UserProfile {
    id: string;
    avatar: string;
    leaderboardPosition: number;
    ipCollection: number;
    ipSold: number;
    totalQuadraticFunding: number;
    referrals: number;
}

const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');

    const userProfile: UserProfile = {
        id: '0xdafe492d9c673...',
        avatar: '/img1.svg',
        leaderboardPosition: 7,
        ipCollection: 19,
        ipSold: 19,
        totalQuadraticFunding: 5300,
        referrals: 26
    };

    const leaderboardData: LeaderboardEntry[] = [
        {
            rank: 1,
            avatar: '/img2.svg',
            user: '0XC05D900F7BE157DA02E7F760C67F4...',
            totalImpactGenerated: 20,
            sredazEarned: 30,
            numberOfIpSold: 30,
            stakedSredaz: '2070.5' 
        },
        {
            rank: 2,
            avatar: '/img2.svg',
            user: '0XC05D900F7BE157DA02E7F760C67F4...',
            totalImpactGenerated: 20,
            sredazEarned: 30,
            numberOfIpSold: 30,
            stakedSredaz: '2,070.5'
        },
        {
            rank: 3,
            avatar: '/img2.svg',
            user: '0XC05D900F7BE157DA02E7F760C67F4...',
            totalImpactGenerated: 20,
            sredazEarned: 30,
            numberOfIpSold: 30,
            stakedSredaz: '2,070.5'
        },
        {
            rank: 4,
            avatar: '/img2.svg',
            user: '0XC05D900F7BE157DA02E7F760C67F4...',
            totalImpactGenerated: 20,
            sredazEarned: 30,
            numberOfIpSold: 30,
            stakedSredaz: '2,070.5'
        },
        {
            rank: 5,
            avatar: '/img2.svg',
            user: '0XC05D900F7BE157DA02E7F760C67F4...',
            totalImpactGenerated: 20,
            sredazEarned: 30,
            numberOfIpSold: 30,
            stakedSredaz: '2,070.5'
        },
        {
            rank: 6,
            avatar: '/img2.svg',
            user: '0XC05D900F7BE157DA02E7F760C67F4...',
            totalImpactGenerated: 20,
            sredazEarned: 30,
            numberOfIpSold: 30,
            stakedSredaz: '2,070.5'
        },
        {
            rank: 7,
            avatar: '/img2.svg',
            user: '0XC05D900F7BE157DA02E7F760C67F4...',
            totalImpactGenerated: 20,
            sredazEarned: 30,
            numberOfIpSold: 30,
            stakedSredaz: '2,070.5'
        },
        {
            rank: 8,
            avatar: '/img2.svg',
            user: '0XC05D900F7BE157DA02E7F760C67F4...',
            totalImpactGenerated: 20,
            sredazEarned: 30,
            numberOfIpSold: 30,
            stakedSredaz: '2,070.5'
        },
        {
            rank: 9,
            avatar: '/img2.svg',
            user: '0XC05D900F7BE157DA02E7F760C67F4...',
            totalImpactGenerated: 20,
            sredazEarned: 30,
            numberOfIpSold: 30,
            stakedSredaz: '2,070.5'
        }
    ];

    const navItems = ['Dashboard', 'My Collection', 'Leaderboard'];

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 text-white p-5 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold mb-5">My Profile</h2>

                            <div className="flex flex-col items-center mb-5">
                                <div className="w-16 h-16 rounded-lg overflow-hidden mb-3">
                                    <Image
                                        src={userProfile.avatar}
                                        alt="Profile"
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                    <span className="font-mono">{userProfile.id}</span>
                                    <button className="text-gray-400 hover:text-white transition-colors">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-gray-400 text-xs mb-3 uppercase tracking-wide">Portfolio Overview</h3>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-xs text-gray-300 uppercase tracking-wide">LEADERBOARD POSITION</span>
                                        <span className="text-white font-semibold text-sm">{userProfile.leaderboardPosition}</span>
                                    </div>

                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-xs text-gray-300 uppercase tracking-wide">IP COLLECTION</span>
                                        <span className="text-white font-semibold text-sm">{userProfile.ipCollection}</span>
                                    </div>

                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-xs text-gray-300 uppercase tracking-wide">IP SOLD</span>
                                        <span className="text-white font-semibold text-sm">{userProfile.ipSold}</span>
                                    </div>

                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-xs text-gray-300 uppercase tracking-wide">TOTAL QUADRATIC FUNDING</span>
                                        <span className="text-white font-semibold text-sm">${userProfile.totalQuadraticFunding}</span>
                                    </div>

                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-xs text-gray-300 uppercase tracking-wide">REFERRALS</span>
                                        <span className="text-white font-semibold text-sm">{userProfile.referrals}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            <div className="bg-gray-900 text-white px-4 py-3">
                                <div className="grid grid-cols-6 gap-3 text-xs font-semibold uppercase tracking-wide">
                                    <div className="text-center">RANK</div>
                                    <div className="text-left">USER</div>
                                    <div className="text-center">TOTAL IMPACT GENERATED</div>
                                    <div className="text-center">SREDAZ EARNED</div>
                                    <div className="text-center">NUMBER OF IP SOLD</div>
                                    <div className="text-center">STAKED SREDAZ</div>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {leaderboardData.map((entry) => (
                                    <div
                                        key={entry.rank}
                                        className={`px-4 py-1 grid grid-cols-6 gap-3 items-center text-sm transition-colors ${entry.rank === userProfile.leaderboardPosition
                                            ? 'border border-black rounded-lg'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="text-center font-semibold text-gray-900">{entry.rank}</div>
                                        <div className="flex items-center space-x-2">
                                            <Image
                                                src={entry.avatar}
                                                alt="User avatar"
                                                width={28}
                                                height={28}
                                                className="rounded-full"
                                            />
                                            <span className="text-xs text-gray-700 uppercase font-mono truncate">
                                                {entry.user}
                                            </span>
                                        </div>
                                        <div className='text-center text-gray-900 font-medium'>{entry.totalImpactGenerated}</div>
                                        <div className='text-center text-gray-900 font-medium'>{entry.sredazEarned}</div>
                                        <div className='text-center text-gray-900 font-medium'>{entry.numberOfIpSold}</div>
                                        <div className='text-center text-gray-900 font-medium'>{entry.stakedSredaz}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-12 border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Regenbazar</h3>
                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                Lorem ipsum dolor sit amet consectetur. Emin mauris aliquam sit a bibendum. Quam velit sit in lorem sit.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 text-sm">Footer Nav</h4>
                            <ul className="space-y-1 text-xs text-gray-600">
                                <li><Link href="#" className="hover:text-gray-900 transition-colors">Nav1</Link></li>
                                <li><Link href="#" className="hover:text-gray-900 transition-colors">Nav1</Link></li>
                                <li><Link href="#" className="hover:text-gray-900 transition-colors">Nav1</Link></li>
                                <li><Link href="#" className="hover:text-gray-900 transition-colors">Nav1</Link></li>
                                <li><Link href="#" className="hover:text-gray-900 transition-colors">Nav1</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 text-sm">Footer Nav</h4>
                            <ul className="space-y-1 text-xs text-gray-600">
                                <li><Link href="#" className="hover:text-gray-900 transition-colors">Nav1</Link></li>
                                <li><Link href="#" className="hover:text-gray-900 transition-colors">Nav1</Link></li>
                                <li><Link href="#" className="hover:text-gray-900 transition-colors">Nav1</Link></li>
                                <li><Link href="#" className="hover:text-gray-900 transition-colors">Nav1</Link></li>
                                <li><Link href="#" className="hover:text-gray-900 transition-colors">Nav1</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 text-sm">Stay In The Loop</h4>
                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                Follow us for the latest news and updates on our social media platforms
                            </p>
                            <div className="flex space-x-2">
                                <a href="#" className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                                    <span className="text-xs font-bold">f</span>
                                </a>
                                <a href="#" className="w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                                    <span className="text-xs font-bold">t</span>
                                </a>
                                <a href="#" className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors">
                                    <span className="text-xs font-bold">in</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-600">
                        Copyright © Regenbazaar. All rights reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ProfilePage;