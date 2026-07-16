'use client'

import React from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { SITE_EMAIL } from '@/lib/site'

function PrivacyPolicyKo() {
  return (
    <div className="prose prose-lg max-w-none">
      <p className="text-gray-600 mb-6">
        <strong>최종 수정일:</strong> 2024년 9월 29일
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. 개인정보의 처리 목적</h2>
        <p className="text-gray-700 leading-relaxed">
          okuma 포트폴리오 웹사이트(이하 &quot;서비스&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다:
        </p>
        <ul className="list-disc pl-6 mt-4 text-gray-700">
          <li>연락처 문의 처리 및 답변</li>
          <li>서비스 제공 및 개선</li>
          <li>이메일 알림 발송</li>
          <li>서비스 이용 통계 분석</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. 처리하는 개인정보의 항목</h2>
        <p className="text-gray-700 leading-relaxed mb-4">서비스는 다음의 개인정보를 처리합니다:</p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">필수 항목:</h3>
          <ul className="list-disc pl-6 text-gray-700">
            <li>이름</li>
            <li>이메일 주소</li>
            <li>연락처 문의 내용</li>
          </ul>
          <h3 className="font-semibold text-gray-800 mb-2 mt-4">자동 수집 항목:</h3>
          <ul className="list-disc pl-6 text-gray-700">
            <li>IP 주소</li>
            <li>접속 일시</li>
            <li>서비스 이용 기록</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. 개인정보의 처리 및 보유 기간</h2>
        <p className="text-gray-700 leading-relaxed">
          서비스는 개인정보 처리 목적이 달성된 후에는 지체없이 해당 개인정보를 파기합니다.
          단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <p className="text-gray-700">
            <strong>연락처 문의 정보:</strong> 문의 처리 완료 후 3년간 보관<br />
            <strong>서비스 이용 기록:</strong> 1년간 보관
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. 개인정보의 제3자 제공</h2>
        <p className="text-gray-700 leading-relaxed">
          서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
          다만, 아래의 경우에는 예외로 합니다:
        </p>
        <ul className="list-disc pl-6 mt-4 text-gray-700">
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. 개인정보처리 위탁</h2>
        <p className="text-gray-700 leading-relaxed">서비스는 개인정보 처리업무를 위탁하지 않습니다.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>개인정보 처리현황 통지요구</li>
          <li>개인정보 열람요구</li>
          <li>개인정보 정정·삭제요구</li>
          <li>개인정보 처리정지요구</li>
        </ul>
        <p className="text-gray-700 mt-4">
          권리 행사는 개인정보보호법 시행령 제41조제1항에 따라 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며,
          서비스는 이에 대해 지체없이 조치하겠습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. 개인정보의 안전성 확보조치</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>개인정보 취급 직원의 최소화 및 교육</li>
          <li>개인정보에 대한 접근 제한</li>
          <li>개인정보의 암호화</li>
          <li>해킹 등에 대비한 기술적 대책</li>
          <li>개인정보처리시스템 등의 접근권한 관리</li>
          <li>개인정보의 안전한 저장·전송을 위한 기술의 적용</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. 개인정보 보호책임자</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">
            <strong>성명:</strong> okuma<br />
            <strong>연락처:</strong> {SITE_EMAIL}<br />
            <strong>직책:</strong> 개인정보보호책임자
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. 개인정보처리방침의 변경</h2>
        <p className="text-gray-700 leading-relaxed">
          이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
          변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
        </p>
      </section>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500">이 개인정보처리방침은 2024년 9월 29일부터 시행됩니다.</p>
      </div>
    </div>
  )
}

function PrivacyPolicyEn() {
  return (
    <div className="prose prose-lg max-w-none">
      <p className="text-gray-600 mb-6">
        <strong>Last updated:</strong> September 29, 2024
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Purpose of Processing Personal Information</h2>
        <p className="text-gray-700 leading-relaxed">
          The okuma portfolio website (hereinafter &quot;Service&quot;) processes personal information for the following purposes:
        </p>
        <ul className="list-disc pl-6 mt-4 text-gray-700">
          <li>Processing and responding to contact inquiries</li>
          <li>Providing and improving the Service</li>
          <li>Sending email notifications</li>
          <li>Analyzing service usage statistics</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Personal Information Collected</h2>
        <p className="text-gray-700 leading-relaxed mb-4">The Service collects the following personal information:</p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Required:</h3>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Name</li>
            <li>Email address</li>
            <li>Contact inquiry content</li>
          </ul>
          <h3 className="font-semibold text-gray-800 mb-2 mt-4">Automatically collected:</h3>
          <ul className="list-disc pl-6 text-gray-700">
            <li>IP address</li>
            <li>Date and time of access</li>
            <li>Service usage records</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Retention Period</h2>
        <p className="text-gray-700 leading-relaxed">
          The Service destroys personal information without delay once the purpose of processing is achieved.
          However, the following information is retained for the periods specified below.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <p className="text-gray-700">
            <strong>Contact inquiry information:</strong> Retained for 3 years after inquiry is resolved<br />
            <strong>Service usage records:</strong> Retained for 1 year
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Sharing with Third Parties</h2>
        <p className="text-gray-700 leading-relaxed">
          The Service does not provide personal information to third parties as a rule.
          Exceptions include:
        </p>
        <ul className="list-disc pl-6 mt-4 text-gray-700">
          <li>When the user has given prior consent</li>
          <li>When required by law or by authorities following legally prescribed procedures</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Outsourcing</h2>
        <p className="text-gray-700 leading-relaxed">The Service does not outsource personal information processing.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
        <p className="text-gray-700 leading-relaxed mb-4">As a data subject, you may exercise the following rights:</p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Request notification of processing status</li>
          <li>Request access to personal information</li>
          <li>Request correction or deletion</li>
          <li>Request suspension of processing</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Security Measures</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The Service takes the following measures to ensure the security of personal information:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Minimizing staff with access and providing training</li>
          <li>Restricting access to personal information</li>
          <li>Encrypting personal information</li>
          <li>Technical measures against hacking</li>
          <li>Managing access permissions for processing systems</li>
          <li>Applying technology for secure storage and transmission</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Privacy Officer</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">
            <strong>Name:</strong> okuma<br />
            <strong>Contact:</strong> {SITE_EMAIL}<br />
            <strong>Title:</strong> Privacy Officer
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to This Policy</h2>
        <p className="text-gray-700 leading-relaxed">
          This Privacy Policy is effective from the date of enforcement. If there are additions, deletions,
          or corrections to the policy, we will notify users at least 7 days before the changes take effect.
        </p>
      </section>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500">This Privacy Policy is effective from September 29, 2024.</p>
      </div>
    </div>
  )
}

export default function PrivacyPolicy() {
  const { locale } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {locale === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}
          </h1>
          {locale === 'ko' ? <PrivacyPolicyKo /> : <PrivacyPolicyEn />}
        </div>
      </div>
    </div>
  )
}
