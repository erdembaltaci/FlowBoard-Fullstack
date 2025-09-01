using System;
using System.Threading.Tasks;

namespace JiraProject.Business.Abstract
{
    /// <summary>
    /// Veritabanı işlemlerini tek bir transaction (işlem bütünlüğü)
    /// içinde yöneten yapının sözleşmesi.
    /// Tek sorumluluğu, yapılan tüm değişiklikleri kaydetmek veya
    /// iptal etmektir.
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        /// <summary>
        /// O ana kadar yapılan tüm değişiklikleri (ekleme, güncelleme, silme)
        /// veritabanına tek bir işlem olarak kaydeder.
        /// </summary>
        /// <returns>Veritabanında etkilenen satır sayısı.</returns>
        Task<int> CompleteAsync();
    }
}